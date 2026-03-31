from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_cart),
    path("add/", views.add_to_cart),
    path("clear/", views.clear_cart),
    path("count/", views.get_cart_count),
    path("items/<uuid:item_id>/", views.remove_cart_item),
    path("items/<uuid:item_id>/update/", views.update_cart_item),
    path("products/<uuid:product_id>/", views.remove_product_from_cart),
]
