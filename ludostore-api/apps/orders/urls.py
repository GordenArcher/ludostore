"""
Order URLs.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("", views.list_orders),
    path("checkout/", views.checkout),
    path("verify-payment/", views.verify_payment),
    path("<uuid:order_id>/", views.get_order),
    path("number/<str:order_number>/", views.get_order_by_number),
    path("<uuid:order_id>/cancel/", views.cancel_order),
]
