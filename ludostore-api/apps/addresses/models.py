import uuid

from django.conf import settings
from django.db import models

"""
Address models for user addresses.

Why separate app:
- Addresses are used across orders, shipping, billing
- Can have multiple addresses per user
- Different types (shipping, billing, both)
- Easy to extend with validation, geocoding, etc.
"""


class Address(models.Model):
    """
    User address model.

    Features:
    - Multiple addresses per user
    - Default address flag (only one default per user per type)
    - Address types (shipping, billing, both)
    - Soft delete (is_deleted flag)
    """

    class AddressType(models.TextChoices):
        SHIPPING = "shipping", "Shipping"
        BILLING = "billing", "Billing"
        BOTH = "both", "Both"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
        db_index=True,
        help_text="User who owns this address",
    )

    address_type = models.CharField(
        max_length=10,
        choices=AddressType.choices,
        default=AddressType.SHIPPING,
        help_text="Type of address: shipping, billing, or both",
    )
    is_default = models.BooleanField(
        default=False, help_text="Whether this is the default address for its type"
    )

    recipient_name = models.CharField(
        max_length=255, help_text="Full name of the recipient"
    )
    phone_number = models.CharField(
        max_length=20, help_text="Contact phone number for delivery"
    )
    street_address = models.CharField(
        max_length=255, help_text="House number and street name"
    )
    apartment = models.CharField(
        max_length=100, blank=True, help_text="Apartment, suite, unit, etc. (optional)"
    )
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Soft delete flag - keep for order history",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "addresses"
        ordering = ["-is_default", "-created_at"]
        indexes = [
            models.Index(fields=["user", "is_deleted"]),
            models.Index(fields=["user", "address_type", "is_default"]),
        ]

    def __str__(self):
        return f"{self.recipient_name} - {self.city}, {self.country}"

    def save(self, *args, **kwargs):
        """
        Override save to handle default address logic.

        When setting an address as default, ensure:
        - Only one default address per user per type
        - If address type is 'both', it's default for both shipping and billing
        """
        if self.is_default:
            # If this address is 'both', it should be the only default for both types
            if self.address_type == self.AddressType.BOTH:
                # Clear any other default 'both' addresses for this user
                Address.objects.filter(
                    user=self.user,
                    address_type=self.AddressType.BOTH,
                    is_default=True,
                    is_deleted=False,
                ).exclude(id=self.id).update(is_default=False)

                # Also clear any individual shipping/billing defaults
                Address.objects.filter(
                    user=self.user,
                    address_type__in=[
                        self.AddressType.SHIPPING,
                        self.AddressType.BILLING,
                    ],
                    is_default=True,
                    is_deleted=False,
                ).update(is_default=False)
            else:
                # Clear any other default of the same type for this user
                Address.objects.filter(
                    user=self.user,
                    address_type=self.address_type,
                    is_default=True,
                    is_deleted=False,
                ).exclude(id=self.id).update(is_default=False)

        super().save(*args, **kwargs)
