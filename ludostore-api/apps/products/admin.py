from django.contrib import admin

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "sku",
        "regular_price",
        "sale_price",
        "stock_quantity",
        "stock_status",
        "is_active",
        "featured",
    ]
    list_filter = ["is_active", "featured", "stock_status", "category"]
    search_fields = ["name", "sku", "description"]
    prepopulated_fields = {"slug": ["name"]}
    inlines = [ProductImageInline]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["product", "image", "is_primary", "order"]
    list_filter = ["is_primary"]
