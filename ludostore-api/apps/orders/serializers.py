"""
Order serializers.
"""

from rest_framework import serializers

from apps.products.serializers import ProductSerializer

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    customization_images = serializers.ListField(child=serializers.URLField(), read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'product_image', 'quantity', 'price_at_purchase', 'subtotal',
            'customization_images', 'created_at'
        ]


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders with items."""

    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "user",
            "shipping_address",
            "subtotal",
            "shipping_fee",
            "tax",
            "discount",
            "total",
            "order_status",
            "payment_method",
            "payment_status",
            "paystack_reference",
            "customer_note",
            "items",
            "total_items",
            "created_at",
            "updated_at",
            "paid_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "user",
            "created_at",
            "updated_at",
            "paid_at",
        ]


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout request."""

    address_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    customer_note = serializers.CharField(required=False, allow_blank=True)


class PaystackInitSerializer(serializers.Serializer):
    """Serializer for Paystack initialization."""

    order_id = serializers.UUIDField()


class PaystackVerifySerializer(serializers.Serializer):
    """Serializer for Paystack verification."""

    reference = serializers.CharField()
