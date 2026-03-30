"""
Account app URLs.

Defines all authentication and profile management endpoints.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("operator/login/", views.operator_login),
    path("logout/", views.logout),
    path("me/", views.profile),
    path("password/change/", views.change_password),
    path("otp/request/", views.request_otp),
    path("otp/verify/", views.verify_otp),
]
