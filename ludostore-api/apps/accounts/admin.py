from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import OTP, User, UserAccount


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for custom User model.
    Hides username, uses email as login field.
    """

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )

    list_display = ("email", "is_staff", "is_superuser", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("email",)
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")


@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    """
    Admin interface for user profile (UserAccount).
    """

    list_display = (
        "user",
        "first_name",
        "last_name",
        "role",
        "account_status",
        "is_email_verified",
        "is_phone_verified",
        "created_at",
    )
    list_filter = ("role", "account_status", "is_email_verified", "is_phone_verified")
    search_fields = ("user__email", "first_name", "last_name", "phone_number")
    readonly_fields = ("created_at", "updated_at")


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    """
    Admin interface for OTPs.
    """

    list_display = ("user", "otp_type", "target", "is_used", "expires_at", "created_at")
    list_filter = ("otp_type", "is_used")
    search_fields = ("user__email", "target", "otp_code")
    readonly_fields = ("created_at",)
