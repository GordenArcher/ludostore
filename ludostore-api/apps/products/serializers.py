"""
Product serializers.

Simple field definitions only no validation logic.
"""

from rest_framework import serializers

from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer."""

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer."""

    class Meta:
        model = ProductImage
        fields = ["id", "product", "image", "is_primary", "order", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    """Product serializer with images and user-specific flags."""

    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    current_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    # User-specific fields (will be populated dynamically)
    is_in_wishlist = serializers.BooleanField(read_only=True, default=False)
    is_in_cart = serializers.BooleanField(read_only=True, default=False)
    cart_item_id = serializers.CharField(read_only=True, default=None)
    cart_quantity = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "category_name",
            "regular_price",
            "sale_price",
            "current_price",
            "sku",
            "stock_quantity",
            "stock_status",
            "is_active",
            "featured",
            "images",
            "is_in_wishlist",
            "is_in_cart",
            "cart_item_id",
            "cart_quantity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products."""

    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "category",
            "regular_price",
            "sale_price",
            "sku",
            "stock_quantity",
            "stock_status",
            "is_active",
            "featured",
        ]


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating products."""

    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "category",
            "regular_price",
            "sale_price",
            "sku",
            "stock_quantity",
            "stock_status",
            "is_active",
            "featured",
        ]
        extra_kwargs = {
            "name": {"required": False},
            "description": {"required": False, "allow_blank": True},
            "category": {"required": False},
            "regular_price": {"required": False},
            "sale_price": {"required": False},
            "sku": {"required": False},
            "stock_quantity": {"required": False},
            "stock_status": {"required": False},
            "is_active": {"required": False},
            "featured": {"required": False},
        }
