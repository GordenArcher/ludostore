from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "product_name",
        "product_sku",
        "quantity",
        "price_at_purchase",
        "subtotal",
    ]
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "user",
        "total",
        "order_status",
        "payment_method",
        "payment_status",
        "created_at",
    ]
    list_filter = ["order_status", "payment_method", "payment_status", "created_at"]
    search_fields = ["order_number", "user__email"]
    readonly_fields = ["id", "order_number", "created_at", "updated_at", "paid_at"]
    inlines = [OrderItemInline]
    fieldsets = (
        ("Order Info", {"fields": ("order_number", "user", "shipping_address")}),
        (
            "Totals",
            {"fields": ("subtotal", "shipping_fee", "tax", "discount", "total")},
        ),
        ("Status", {"fields": ("order_status", "payment_method", "payment_status")}),
        (
            "Payment",
            {"fields": ("paystack_reference", "paystack_access_code", "paid_at")},
        ),
        ("Notes", {"fields": ("customer_note", "admin_note")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "product_name",
        "quantity",
        "price_at_purchase",
        "subtotal",
    ]
    list_filter = ["created_at"]
    search_fields = ["order__order_number", "product_name"]
    readonly_fields = ["id", "created_at"]
