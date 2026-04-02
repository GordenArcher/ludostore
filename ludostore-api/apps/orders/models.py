"""
Order models for e-commerce orders.
"""

import uuid
from datetime import datetime

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.products.models import Product


def generate_order_number():
    """
    Generate unique order number.
    Format: ORD-YYYYMMDD-XXXXXXXX (8 random chars)
    Example: ORD-20241231-A1B2C3D4
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_suffix = uuid.uuid4().hex[:8].upper()
    return f"ORD-{date_str}-{random_suffix}"


class Order(models.Model):
    """
    Order model - created from cart after checkout.
    """

    class OrderStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash on Delivery"
        PAYSTACK = "paystack", "Paystack"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        default=generate_order_number,
        editable=False,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders"
    )

    # Address snapshot (copy from user's address at checkout)
    shipping_address = models.JSONField(
        help_text="Snapshot of shipping address at checkout"
    )

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    order_status = models.CharField(
        max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )

    paystack_reference = models.CharField(max_length=100, blank=True, null=True)
    paystack_access_code = models.CharField(max_length=100, blank=True, null=True)

    customer_note = models.TextField(blank=True)
    admin_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_number} - {self.user.email}"

    def save(self, *args, **kwargs):

        super().save(*args, **kwargs)

    @property
    def total_items(self):
        return self.items.aggregate(total=models.Sum("quantity"))["total"] or 0



class OrderItem(models.Model):
    """
    Order items, snapshot of cart items at checkout.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items'
    )

    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    product_image = models.CharField(max_length=500, blank=True)

    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)


    customization_images = models.JSONField(default=list, blank=True, help_text="Array of image URLs for customization (max 4)")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantity} x {self.product_name} - {self.order.order_number}"

    def save(self, *args, **kwargs):
        self.subtotal = self.price_at_purchase * self.quantity
        super().save(*args, **kwargs)

    def can_upload_images(self) -> bool:
        """Check if customization images can be uploaded for this item."""
        # Cannot upload if order is shipped, delivered, or cancelled
        forbidden_statuses = [
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.REFUNDED,
        ]
        return self.order.order_status not in forbidden_statuses

    def can_delete_images(self) -> bool:
        """Check if customization images can be deleted."""
        # Same as upload, cannot delete after shipped
        return self.can_upload_images()
