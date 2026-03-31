"""
Order service layer.
"""

import logging
from typing import Dict, Optional
from uuid import UUID

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.addresses.models import Address
from apps.cart.services import CartService
from apps.notifications.services.email_service import EmailService

from .models import Order, OrderItem

logger = logging.getLogger(__name__)


class OrderService:
    """
    Service for order operations.
    """

    @staticmethod
    def create_order_from_cart(
        user, address_id: UUID, payment_method: str, customer_note: str = ""
    ) -> Optional[Order]:
        """
        Create an order from user's cart.

        Steps:
        1. Get cart and validate items
        2. Check stock availability
        3. Create order with address snapshot
        4. Create order items with price snapshots
        5. Deduct stock from products
        6. Clear cart
        7. Queue order confirmation email

        Returns:
            Order: The created order, or None if cart is empty or stock insufficient
        """

        # Get cart
        cart = CartService.get_cart(user)
        cart_items = cart.items.all()

        if not cart_items:
            return None

        # Get shipping address
        try:
            address = Address.objects.get(id=address_id, user=user, is_deleted=False)
        except Address.DoesNotExist:
            return None

        # Check stock and prepare order items
        order_items_data = []
        subtotal = 0

        for cart_item in cart_items:
            product = cart_item.product

            # Check stock
            if product.stock_quantity < cart_item.quantity:
                logger.warning(
                    f"Insufficient stock: {product.sku} - requested: {cart_item.quantity}, available: {product.stock_quantity}"
                )
                return None

            # Get primary image
            primary_image = product.images.filter(is_primary=True).first()
            product_image = primary_image.image.url if primary_image else ""

            order_items_data.append(
                {
                    "product": product,
                    "product_name": product.name,
                    "product_sku": product.sku,
                    "product_image": product_image,
                    "quantity": cart_item.quantity,
                    "price_at_purchase": cart_item.price_at_add,
                }
            )

            subtotal += cart_item.subtotal

        with transaction.atomic():
            # Create order
            order = Order.objects.create(
                user=user,
                shipping_address={
                    "id": str(address.id),
                    "recipient_name": address.recipient_name,
                    "phone_number": address.phone_number,
                    "street_address": address.street_address,
                    "apartment": address.apartment,
                    "city": address.city,
                    "state": address.state,
                    "postal_code": address.postal_code,
                    "country": address.country,
                },
                subtotal=subtotal,
                shipping_fee=0,
                tax=0,
                discount=0,
                total=subtotal,
                payment_method=payment_method,
                customer_note=customer_note,
            )

            # Create order items
            for item_data in order_items_data:
                OrderItem.objects.create(order=order, **item_data)

                # Deduct stock
                product = item_data["product"]
                product.stock_quantity -= item_data["quantity"]
                product.save(update_fields=["stock_quantity"])

            # Clear cart
            CartService.clear_cart(user)

            logger.info(f"Order created: {order.order_number} for user {user.id}")

            return order

    @staticmethod
    def get_user_orders(user, page: int = 1, page_size: int = 20):
        """
        Get paginated list of user orders.
        """
        from django.core.paginator import Paginator

        orders = Order.objects.filter(user=user)

        paginator = Paginator(orders, page_size)
        page_obj = paginator.get_page(page)

        return {
            "items": list(page_obj.object_list),
            "total": paginator.count,
            "page": page,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "has_next": page_obj.has_next(),
            "has_prev": page_obj.has_previous(),
        }

    @staticmethod
    def get_order_by_id(user, order_id: UUID) -> Optional[Order]:
        """
        Get a single order by ID for a user.
        """
        try:
            return Order.objects.get(id=order_id, user=user)
        except Order.DoesNotExist:
            return None

    @staticmethod
    def get_order_by_number(user, order_number: str) -> Optional[Order]:
        """
        Get a single order by order number for a user.
        """
        try:
            return Order.objects.get(order_number=order_number, user=user)
        except Order.DoesNotExist:
            return None


class PaystackService:
    """
    Service for Paystack payment integration.
    """

    @staticmethod
    def initialize_payment(order: Order, user_email: str) -> Optional[Dict]:
        """
        Initialize Paystack payment.

        Returns:
            Dict with authorization_url and access_code, or None if failed
        """
        url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "email": user_email,
            "amount": int(order.total * 100),  # Paystack uses kobo/cents
            "reference": f"{order.order_number}_{order.id.hex[:8]}",
            "callback_url": f"{settings.FRONTEND_URL}/payment/verify",
            "metadata": {
                "order_id": str(order.id),
                "order_number": order.order_number,
            },
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response_data = response.json()

            if response_data.get("status"):
                data = response_data.get("data", {})
                return {
                    "authorization_url": data.get("authorization_url"),
                    "access_code": data.get("access_code"),
                    "reference": data.get("reference"),
                }

            logger.error(f"Paystack init failed: {response_data}")
            return None

        except Exception as e:
            logger.exception(f"Paystack initialization error: {e}")
            return None

    @staticmethod
    def verify_payment(reference: str) -> Optional[Dict]:
        """
        Verify Paystack payment.

        Returns:
            Dict with payment status and data, or None if verification failed
        """
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }

        try:
            response = requests.get(url, headers=headers, timeout=30)
            response_data = response.json()

            if response_data.get("status"):
                data = response_data.get("data", {})
                return {
                    "status": data.get("status"),
                    "amount": data.get("amount"),
                    "reference": data.get("reference"),
                    "metadata": data.get("metadata", {}),
                }

            logger.error(f"Paystack verify failed: {response_data}")
            return None

        except Exception as e:
            logger.exception(f"Paystack verification error: {e}")
            return None

    @staticmethod
    def update_order_payment(order: Order, payment_data: Dict) -> Order:
        """
        Update order after successful payment.
        """
        with transaction.atomic():
            order.payment_status = Order.PaymentStatus.PAID
            order.paystack_reference = payment_data.get("reference")
            order.paid_at = timezone.now()
            order.save(
                update_fields=["payment_status", "paystack_reference", "paid_at"]
            )

            logger.info(f"Order payment completed: {order.order_number}")
            return order
