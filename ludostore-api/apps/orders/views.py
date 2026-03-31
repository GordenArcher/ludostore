"""
Order views.
"""

import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.notifications.services.email_service import EmailService
from apps.orders.models import Order
from common.utils.pagination import get_pagination_params
from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

from .serializers import (
    CheckoutSerializer,
    OrderSerializer,
    PaystackVerifySerializer,
)
from .services import OrderService, PaystackService

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    """
    Create order from cart.
    - For CASH: order created immediately
    - For PAYSTACK: order created, payment initialized
    """
    request_id = generate_request_id()

    serializer = CheckoutSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Checkout failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        order = OrderService.create_order_from_cart(
            user=request.user,
            address_id=serializer.validated_data["address_id"],
            payment_method=serializer.validated_data["payment_method"],
            customer_note=serializer.validated_data.get("customer_note", ""),
        )

        if not order:
            return error_response(
                message="Cart is empty or insufficient stock",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="CHECKOUT_FAILED",
                request_id=request_id,
            )

        # Prepare user_name for email
        user_name = (
            f"{request.user.account.first_name} {request.user.account.last_name}".strip()
            or request.user.email.split("@")[0]
        )

        # Prepare serialized order data for email
        order_data = {
            "id": str(order.id),
            "order_number": order.order_number,
            "subtotal": str(order.subtotal),
            "shipping_fee": str(order.shipping_fee),
            "tax": str(order.tax),
            "discount": str(order.discount),
            "total": str(order.total),
            "order_status": order.order_status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "customer_note": order.customer_note,
            "shipping_address": order.shipping_address,
            "items": [
                {
                    "id": str(item.id),
                    "product_name": item.product_name,
                    "product_sku": item.product_sku,
                    "quantity": item.quantity,
                    "price_at_purchase": str(item.price_at_purchase),
                    "subtotal": str(item.subtotal),
                }
                for item in order.items.all()
            ],
            "created_at": order.created_at.isoformat(),
        }

        # If payment method is Paystack, initialize payment
        if order.payment_method == Order.PaymentMethod.PAYSTACK:
            payment_data = PaystackService.initialize_payment(order, request.user.email)

            if not payment_data:
                return error_response(
                    message="Payment initialization failed",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    code="PAYMENT_INIT_FAILED",
                    request_id=request_id,
                )

            # Store access code and reference
            order.paystack_access_code = payment_data.get("access_code")
            order.paystack_reference = payment_data.get("reference")
            order.save(update_fields=["paystack_access_code", "paystack_reference"])

            # Queue order confirmation email (async)
            EmailService.send_order_confirmation_email(
                email=request.user.email, order_data=order_data, user_name=user_name
            )

            return success_response(
                message="Order created. Proceed to payment.",
                data={
                    "order": OrderSerializer(order).data,
                    "payment": {
                        "authorization_url": payment_data.get("authorization_url"),
                        "reference": payment_data.get("reference"),
                    },
                },
                status_code=status.HTTP_200_OK,
                code="CHECKOUT_PAYMENT_REQUIRED",
                request_id=request_id,
            )

        # Cash on delivery, order is ready
        # Queue order confirmation email (async)
        EmailService.send_order_confirmation_email(
            email=request.user.email, order_data=order_data, user_name=user_name
        )

        return success_response(
            message="Order placed successfully",
            data={"order": OrderSerializer(order).data},
            status_code=status.HTTP_200_OK,
            code="ORDER_CREATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Checkout error: {e}")
        return error_response(
            message="Checkout failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CHECKOUT_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Verify Paystack payment after user returns from payment page.
    """
    request_id = generate_request_id()

    serializer = PaystackVerifySerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Payment verification failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        # Verify with Paystack
        payment_data = PaystackService.verify_payment(
            serializer.validated_data["reference"]
        )

        if not payment_data:
            return error_response(
                message="Payment verification failed",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="VERIFICATION_FAILED",
                request_id=request_id,
            )

        # Find order by reference in metadata
        metadata = payment_data.get("metadata", {})
        order_id = metadata.get("order_id")

        if not order_id:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        order = OrderService.get_order_by_id(request.user, order_id)

        if not order:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        # Update order based on payment status
        if payment_data.get("status") == "success":
            order = PaystackService.update_order_payment(order, payment_data)
            return success_response(
                message="Payment verified successfully",
                data={"order": OrderSerializer(order).data},
                status_code=status.HTTP_200_OK,
                code="PAYMENT_SUCCESS",
                request_id=request_id,
            )
        else:
            return error_response(
                message=f"Payment failed: {payment_data.get('status')}",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="PAYMENT_FAILED",
                request_id=request_id,
            )

    except Exception as e:
        logger.exception(f"Payment verification error: {e}")
        return error_response(
            message="Payment verification failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="VERIFICATION_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_orders(request):
    """
    Get user's orders with pagination.
    """
    request_id = generate_request_id()

    try:
        page, page_size = get_pagination_params(request)

        result = OrderService.get_user_orders(
            user=request.user, page=page, page_size=page_size
        )

        serializer = OrderSerializer(result["items"], many=True)

        return success_response(
            message="Orders retrieved",
            data={
                "orders": serializer.data,
                "pagination": {
                    "total": result["total"],
                    "page": result["page"],
                    "page_size": result["page_size"],
                    "total_pages": result["total_pages"],
                    "has_next": result["has_next"],
                    "has_prev": result["has_prev"],
                },
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error listing orders: {e}")
        return error_response(
            message="Failed to retrieve orders",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ORDERS_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order(request, order_id):
    """
    Get single order by ID.
    """
    request_id = generate_request_id()

    try:
        order = OrderService.get_order_by_id(request.user, order_id)

        if not order:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        serializer = OrderSerializer(order)
        return success_response(
            message="Order retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving order: {e}")
        return error_response(
            message="Failed to retrieve order",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ORDER_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order_by_number(request, order_number):
    """
    Get single order by order number.
    """
    request_id = generate_request_id()

    try:
        order = OrderService.get_order_by_number(request.user, order_number)

        if not order:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        serializer = OrderSerializer(order)
        return success_response(
            message="Order retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving order: {e}")
        return error_response(
            message="Failed to retrieve order",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ORDER_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    """
    Cancel order (only if status is pending).
    """
    request_id = generate_request_id()

    try:
        order = OrderService.get_order_by_id(request.user, order_id)

        if not order:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        if order.order_status != Order.OrderStatus.PENDING:
            return error_response(
                message=f"Cannot cancel order with status: {order.order_status}",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS",
                request_id=request_id,
            )

        # Restore stock
        for item in order.items.all():
            product = item.product
            product.stock_quantity += item.quantity
            product.save(update_fields=["stock_quantity"])

        # Update order status
        order.order_status = Order.OrderStatus.CANCELLED
        order.save(update_fields=["order_status"])

        logger.info(f"Order cancelled: {order.order_number}")

        return success_response(
            message="Order cancelled successfully",
            data={"order": OrderSerializer(order).data},
            status_code=status.HTTP_200_OK,
            code="ORDER_CANCELLED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error cancelling order: {e}")
        return error_response(
            message="Failed to cancel order",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CANCEL_ERROR",
            request_id=request_id,
        )
