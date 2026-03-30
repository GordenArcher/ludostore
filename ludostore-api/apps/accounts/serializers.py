"""
Account serializers.

IMPORTANT: These serializers are PURELY for data transformation.
No validation logic here. No business logic here. No password checks.
They simply define how data should be structured for input/output.

Validation happens in services. Serializers only define field structure.
"""

from rest_framework import serializers

from .models import User, UserAccount


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Only exposes authentication-related fields.
    """

    class Meta:
        model = User
        fields = ["id", "email", "date_joined", "last_login"]
        read_only_fields = ["id", "date_joined", "last_login"]


class UserAccountSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.
    Includes email from the related User model.
    """

    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserAccount
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "account_status",
            "role",
            "is_email_verified",
            "is_phone_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "account_status",
            "role",
            "is_email_verified",
            "is_phone_verified",
            "created_at",
            "updated_at",
        ]
