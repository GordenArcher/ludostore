"""
Address serializers.

Simple field definitions only - no validation logic.
"""

from rest_framework import serializers

from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for Address model.
    Includes all fields except soft-deleted ones.
    """

    class Meta:
        model = Address
        fields = [
            "id",
            "user",
            "address_type",
            "is_default",
            "recipient_name",
            "phone_number",
            "street_address",
            "apartment",
            "city",
            "state",
            "postal_code",
            "country",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class AddressCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new address.
    User is set automatically from request.
    """

    class Meta:
        model = Address
        fields = [
            "address_type",
            "is_default",
            "recipient_name",
            "phone_number",
            "street_address",
            "apartment",
            "city",
            "state",
            "postal_code",
            "country",
        ]


class AddressUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an address.
    All fields optional.
    """

    class Meta:
        model = Address
        fields = [
            "address_type",
            "is_default",
            "recipient_name",
            "phone_number",
            "street_address",
            "apartment",
            "city",
            "state",
            "postal_code",
            "country",
        ]
        extra_kwargs = {
            "address_type": {"required": False},
            "is_default": {"required": False},
            "recipient_name": {"required": False},
            "phone_number": {"required": False},
            "street_address": {"required": False},
            "city": {"required": False},
            "state": {"required": False},
            "postal_code": {"required": False},
            "country": {"required": False},
        }
