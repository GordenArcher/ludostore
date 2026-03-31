"""
Wishlist serializers.
Simple field definitions only no validation logic.
"""

from rest_framework import serializers

from apps.products.serializers import ProductSerializer

from .models import Wishlist, WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items with product details."""

    product_details = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "product_details", "notes", "added_at"]
        read_only_fields = ["id", "added_at"]


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist with items."""

    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "user", "items", "total_items", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class AddToWishlistSerializer(serializers.Serializer):
    """Serializer for adding item to wishlist."""

    product_id = serializers.UUIDField()
    notes = serializers.CharField(required=False, allow_blank=True)
