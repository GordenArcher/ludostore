from django.contrib import admin

from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = [
        "recipient_name",
        "user",
        "address_type",
        "is_default",
        "city",
        "country",
    ]
    list_filter = ["address_type", "is_default", "is_deleted", "country"]
    search_fields = ["recipient_name", "phone_number", "street_address", "city"]
    readonly_fields = ["created_at", "updated_at"]
