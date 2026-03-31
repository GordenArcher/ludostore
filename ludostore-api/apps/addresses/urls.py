"""
Address URLs.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("", views.address_list),
    path("<int:address_id>/", views.address_detail),
    path("<int:address_id>/set-default/", views.set_default_address),
]
