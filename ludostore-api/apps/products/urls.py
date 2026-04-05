"""
Product URLs.

Separation:
- Public endpoints: GET only, no auth
- Admin endpoints: Full CRUD, operator only
"""

from django.urls import path

from . import views

urlpatterns = [
    path("", views.list_products),
    path("categories/", views.list_categories),
    path("categories/<uuid:category_id>/", views.get_category),
    path("<uuid:product_id>/", views.get_product),
    path("operator/categories/", views.admin_create_category),
    path("operator/categories/<uuid:category_id>/", views.admin_update_category),
    path("operator/categories/<uuid:category_id>/delete/", views.admin_delete_category),
    path("operator/products/", views.admin_create_product),
    path("operator/products/<uuid:product_id>/", views.admin_update_product),
    path("operator/products/<uuid:product_id>/delete/", views.admin_delete_product),
]
