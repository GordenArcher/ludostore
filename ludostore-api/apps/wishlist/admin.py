from django.contrib import admin

from .models import Wishlist, WishlistItem


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 1
    raw_id_fields = ["product"]


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "total_items", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    inlines = [WishlistItemInline]


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ["id", "wishlist", "product", "added_at"]
    list_filter = ["added_at"]
    search_fields = ["wishlist__user__email", "product__name"]
    raw_id_fields = ["wishlist", "product"]
    readonly_fields = ["id", "added_at"]
