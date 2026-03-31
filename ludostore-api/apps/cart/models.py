"""
Cart models for shopping cart functionality.
"""

import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.products.models import Product


class Cart(models.Model):
    """
    Shopping cart for logged-in users.
    One cart per user.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "carts"

    def __str__(self):
        return f"Cart - {self.user.email}"

    @property
    def total_items(self):
        return self.items.aggregate(total=models.Sum("quantity"))["total"] or 0

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    """
    Individual items in a cart.
    Saves price snapshot at time of adding.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="cart_items"
    )
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    # Price snapshot - saved at time of adding to cart
    # This ensures price doesn't change if product price updates later
    price_at_add = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Price of product when added to cart"
    )

    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cart_items"
        unique_together = ["cart", "product"]

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def subtotal(self):
        return self.price_at_add * self.quantity
