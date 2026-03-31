from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ["product"]
    readonly_fields = ["price_at_add", "added_at", "updated_at"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "total_items", "subtotal", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "cart",
        "product",
        "quantity",
        "price_at_add",
        "subtotal",
        "added_at",
    ]
    list_filter = ["added_at"]
    search_fields = ["cart__user__email", "product__name"]
    raw_id_fields = ["cart", "product"]
    readonly_fields = ["id", "price_at_add", "added_at", "updated_at"]
