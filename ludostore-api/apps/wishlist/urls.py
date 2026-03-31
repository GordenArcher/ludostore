"""
Wishlist URLs.

One endpoint per action - clean and RESTful.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_wishlist, name="get-wishlist"),
    path("add/", views.add_to_wishlist),
    path("clear/", views.clear_wishlist),
    path("items/<uuid:item_id>/", views.remove_wishlist_item),
    path("items/<uuid:item_id>/notes/", views.update_wishlist_item_notes),
    path("products/<uuid:product_id>/", views.remove_product_from_wishlist),
    path("check/<uuid:product_id>/", views.check_in_wishlist),
]
