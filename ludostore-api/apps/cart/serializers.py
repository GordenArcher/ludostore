"""
Cart serializers.
Simple field definitions only no validation logic.
"""

from rest_framework import serializers

from apps.products.serializers import ProductSerializer

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items with product details."""

    product_details = ProductSerializer(source="product", read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_details",
            "quantity",
            "price_at_add",
            "subtotal",
            "added_at",
            "updated_at",
        ]
        read_only_fields = ["id", "price_at_add", "added_at", "updated_at"]


class CartSerializer(serializers.ModelSerializer):
    """Serializer for cart with items."""

    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = [
            "id",
            "user",
            "items",
            "total_items",
            "subtotal",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding item to cart."""

    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(default=1, min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""

    quantity = serializers.IntegerField(min_value=1)
