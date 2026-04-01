"""
Operator URLs.
All endpoints are under /api/operator/ prefix.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/stats/", views.dashboard_stats),
    path("dashboard/revenue/", views.revenue_chart),
    path("orders/", views.operator_orders),
    path("orders/<uuid:order_id>/", views.operator_order_detail),
    path("orders/<uuid:order_id>/status/", views.update_order_status),
    path("products/", views.operator_products),
    path("products/<uuid:product_id>/stock/", views.update_product_stock),
    path("products/<uuid:product_id>/images/", views.add_product_image),
    path("users/", views.operator_users),
    path("users/<uuid:user_id>/status/", views.update_user_status),
    path("users/<uuid:user_id>/role/", views.update_user_role),
]
