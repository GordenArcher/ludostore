"""
Order views.
"""

import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.notifications.services.email_service import EmailService
from apps.orders.models import Order, OrderItem
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

    When cancelling:
    - Restore product stock
    - Delete customization images from storage
    - Update order status to cancelled
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

        # Delete customization images from storage
        from .utils import delete_customization_images

        for item in order.items.all():
            if item.customization_images:
                delete_customization_images(str(item.id), item.customization_images)
                logger.info(f"Deleted {len(item.customization_images)} customization images for order item {item.id}")

        # Restore stock
        for item in order.items.all():
            product = item.product
            product.stock_quantity += item.quantity
            product.save(update_fields=["stock_quantity"])

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




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_customization_images(request, order_id, item_id):
    """
    Upload customization images for an order item.

    Rules:
    - Max 4 images per order item
    - Max 5MB per image
    - Only allowed if order status is pending or processing
    - Allowed formats: JPEG, PNG, GIF, WEBP, BMP

    Request: multipart/form-data with 'images' field (multiple files)
    """
    request_id = generate_request_id()

    try:
        # Get order and check ownership
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id
            )

        # Get order item
        try:
            item = OrderItem.objects.get(id=item_id, order=order)
        except OrderItem.DoesNotExist:
            return error_response(
                message="Order item not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_ITEM_NOT_FOUND",
                request_id=request_id
            )

        # Check if uploads are allowed
        if not item.can_upload_images():
            return error_response(
                message=f"Cannot upload images. Order status is '{order.order_status}'. Only pending or processing orders allowed.",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="UPLOAD_NOT_ALLOWED",
                request_id=request_id
            )

        # Check current image count
        current_images = item.customization_images or []
        if len(current_images) >= 4:
            return error_response(
                message="Maximum 4 images allowed per item",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="MAX_IMAGES_REACHED",
                request_id=request_id
            )

        # Get uploaded files
        files = request.FILES.getlist('images')

        if not files:
            return error_response(
                message="No images provided",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="NO_IMAGES",
                request_id=request_id
            )

        # Calculate remaining slots
        remaining_slots = 4 - len(current_images)

        if len(files) > remaining_slots:
            return error_response(
                message=f"Too many images. You can only add {remaining_slots} more image(s)",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="TOO_MANY_IMAGES",
                request_id=request_id
            )

        # Validate files
        from common.utils.file_validation import validate_multiple_images
        is_valid, valid_files, error = validate_multiple_images(files, max_files=remaining_slots, max_size_mb=5)

        if not is_valid:
            return error_response(
                message="Image validation failed",
                errors=error,
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_IMAGES",
                request_id=request_id
            )

        from .utils import save_customization_images
        saved_urls = save_customization_images(str(item.id), valid_files)

        new_images = current_images + saved_urls
        item.customization_images = new_images
        item.save(update_fields=['customization_images'])

        logger.info(f"Uploaded {len(saved_urls)} images for order item {item_id} by {request.user.email}")

        return success_response(
            message=f"Successfully uploaded {len(saved_urls)} image(s)",
            data={
                'item_id': str(item.id),
                'customization_images': new_images,
                'uploaded': saved_urls,
                'total_images': len(new_images),
                'remaining_slots': 4 - len(new_images),
            },
            status_code=status.HTTP_200_OK,
            code="IMAGES_UPLOADED",
            request_id=request_id
        )

    except Exception as e:
        logger.exception(f"Error uploading customization images: {e}")
        return error_response(
            message="Failed to upload images",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="UPLOAD_ERROR",
            request_id=request_id
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_customization_image(request, order_id, item_id, image_index):
    """
    Delete a specific customization image from an order item.

    URL param: image_index, Index of image to delete (0-based)
    """
    request_id = generate_request_id()

    try:
        # Get order and check ownership
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id
            )

        # Get order item
        try:
            item = OrderItem.objects.get(id=item_id, order=order)
        except OrderItem.DoesNotExist:
            return error_response(
                message="Order item not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_ITEM_NOT_FOUND",
                request_id=request_id
            )

        # Check if deletion is allowed
        if not item.can_delete_images():
            return error_response(
                message=f"Cannot delete images. Order status is '{order.order_status}'",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="DELETE_NOT_ALLOWED",
                request_id=request_id
            )

        current_images = item.customization_images or []

        if image_index < 0 or image_index >= len(current_images):
            return error_response(
                message="Invalid image index",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_INDEX",
                request_id=request_id
            )


        image_url = current_images[image_index]

        from .utils import delete_customization_images
        delete_customization_images(str(item.id), [image_url])

        current_images.pop(image_index)
        item.customization_images = current_images
        item.save(update_fields=['customization_images'])

        logger.info(f"Deleted image {image_index} from order item {item_id} by {request.user.email}")

        return success_response(
            message="Image deleted successfully",
            data={
                'item_id': str(item.id),
                'customization_images': current_images,
                'total_images': len(current_images),
                'remaining_slots': 4 - len(current_images),
            },
            status_code=status.HTTP_200_OK,
            code="IMAGE_DELETED",
            request_id=request_id
        )

    except Exception as e:
        logger.exception(f"Error deleting customization image: {e}")
        return error_response(
            message="Failed to delete image",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="DELETE_ERROR",
            request_id=request_id
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_customization_images(request, order_id, item_id):
    """
    Get all customization images for an order item.
    """
    request_id = generate_request_id()

    try:
        # Get order and check ownership
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id
            )

        # Get order item
        try:
            item = OrderItem.objects.get(id=item_id, order=order)
        except OrderItem.DoesNotExist:
            return error_response(
                message="Order item not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_ITEM_NOT_FOUND",
                request_id=request_id
            )

        images = item.customization_images or []

        return success_response(
            message="Customization images retrieved",
            data={
                'item_id': str(item.id),
                'product_name': item.product_name,
                'customization_images': images,
                'total_images': len(images),
                'remaining_slots': 4 - len(images),
                'can_upload': item.can_upload_images(),
                'can_delete': item.can_delete_images(),
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id
        )

    except Exception as e:
        logger.exception(f"Error getting customization images: {e}")
        return error_response(
            message="Failed to retrieve images",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="RETRIEVE_ERROR",
            request_id=request_id
        )
