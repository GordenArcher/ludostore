"""
Wishlist model for users to save favorite products.
"""

import uuid

from django.conf import settings
from django.db import models

from apps.products.models import Product


class Wishlist(models.Model):
    """
    User wishlist, one per user.

    Features:
    - One wishlist per user (simple approach)
    - Cannot add duplicate products
    - Tracks when items were added
    - Optional notes per product
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist",
        help_text="User who owns this wishlist",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "wishlists"
        verbose_name = "Wishlist"
        verbose_name_plural = "Wishlists"

    def __str__(self):
        return f"{self.user.email}'s wishlist"

    @property
    def total_items(self):
        return self.items.count()


class WishlistItem(models.Model):
    """
    Individual items in a wishlist.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wishlist = models.ForeignKey(
        Wishlist,
        on_delete=models.CASCADE,
        related_name="items",
        help_text="The wishlist this item belongs to",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
        help_text="The product in the wishlist",
    )
    notes = models.TextField(
        blank=True,
        help_text="Optional notes (e.g., 'birthday gift', 'want this in red')",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlist_items"
        verbose_name = "Wishlist Item"
        verbose_name_plural = "Wishlist Items"
        unique_together = ["wishlist", "product"]  # Prevent duplicate products
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s wishlist"
