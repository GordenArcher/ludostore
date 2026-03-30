"""
Account models for user management.

Models are thin and only define data structure.
No business logic in models - all logic goes to services and utils.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

from .constants import AccountStatus, OTPType, Role


class UserManager(BaseUserManager):
    """
    Custom user manager for User model with email as unique identifier.

    Why custom manager:
    - Django's default manager requires username field
    - We removed username, so we need to override create_user and create_superuser
    - Ensures email is used as the unique identifier for authentication
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        """
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model using email as the unique identifier.

    Why we remove username:
    - Email is more user-friendly and universally understood
    - Reduces confusion about which identifier to use for login
    - Email naturally provides uniqueness

    Why AbstractUser vs AbstractBaseUser:
    - AbstractUser includes Django's default auth fields (password, last_login, etc.)
    - Saves us from re-implementing core authentication functionality
    - We only need to customize the identifier field
    """

    username = None  # Explicitly remove username field
    email = models.EmailField(
        unique=True,
        db_index=True,
        help_text="Email address used for login and communications",
    )

    USERNAME_FIELD = "email"  # Use email as the login identifier
    REQUIRED_FIELDS = []  # No additional required fields beyond email/password

    objects = UserManager()  # Use custom manager

    class Meta:
        db_table = "auth_user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


class UserAccount(models.Model):
    """
    Extended user profile with account management features.

    Why separate from User model:
    1. Separation of concerns: Authentication data vs profile data
    2. Security: Password and login attempts separated from profile info
    3. Compliance: Easier to anonymize profile data while keeping auth data for legal reasons
    4. Performance: Profile fields can be loaded separately when not needed
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="account",
        db_index=True,
        help_text="One-to-one relationship with the User model",
    )

    # Personal information
    first_name = models.CharField(
        max_length=150, blank=True, help_text="User's first name (optional)"
    )
    last_name = models.CharField(
        max_length=150, blank=True, help_text="User's last name (optional)"
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number in international format (e.g., 233244123456)",
    )

    # Account state
    account_status = models.CharField(
        max_length=20,
        choices=AccountStatus.CHOICES,
        default=AccountStatus.ACTIVE,
        db_index=True,
        help_text="Current status of the account",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.CHOICES,
        default=Role.CUSTOMER,
        db_index=True,
        help_text="User role for access control",
    )

    # Verification flags
    is_email_verified = models.BooleanField(
        default=False, help_text="Whether the user's email has been verified"
    )
    is_phone_verified = models.BooleanField(
        default=False,
        help_text="Whether the user's phone number has been verified (future use)",
    )

    # Security fields for brute force protection
    failed_login_attempts = models.PositiveSmallIntegerField(
        default=0, help_text="Consecutive failed login attempts"
    )
    locked_until = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Account locked until this timestamp (if locked)",
    )

    # Block tracking (when account is blocked/suspended)
    block_reason = models.TextField(
        blank=True, null=True, help_text="Reason for account block (if blocked)"
    )
    blocked_at = models.DateTimeField(
        blank=True, null=True, help_text="When the account was blocked"
    )
    blocked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blocked_accounts",
        help_text="Which operator blocked this account",
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Account creation timestamp"
    )
    updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

    class Meta:
        db_table = "user_accounts"
        verbose_name = "User Account"
        verbose_name_plural = "User Accounts"
        indexes = [
            models.Index(fields=["account_status", "role"]),
            models.Index(fields=["is_email_verified"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.role}"


class OTP(models.Model):
    """
    One-Time Password model for verification flows.

    Why a unified OTP model:
    1. Single table for all verification types (email verification, password reset, login)
    2. Easy cleanup of expired OTPs (one query instead of multiple)
    3. Consistent auditing across all verification attempts
    4. Supports variable length OTPs (6-digit for users, 32-char for API keys)
    5. Rate limiting can be applied uniformly

    Important: This model is intentionally simple. All business logic (generation,
    validation, expiry) is handled by services and utils functions.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="otps",
        db_index=True,
        help_text="User associated with this OTP",
    )
    otp_code = models.CharField(
        max_length=64,
        help_text="The OTP code (can be numeric or alphanumeric depending on type)",
    )
    otp_type = models.CharField(
        max_length=30,
        choices=OTPType.CHOICES,
        db_index=True,
        help_text="What this OTP is used for (verification, password reset, etc.)",
    )
    target = models.EmailField(help_text="Target email address (for OTP delivery)")
    is_used = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this OTP has already been consumed",
    )
    expires_at = models.DateTimeField(
        db_index=True, help_text="OTP expires after this timestamp"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="When this OTP was created"
    )

    # Request metadata for security auditing
    ip_address = models.GenericIPAddressField(
        blank=True, null=True, help_text="IP address that requested this OTP"
    )
    user_agent = models.CharField(
        max_length=500, blank=True, help_text="User agent of the requestor"
    )

    class Meta:
        db_table = "otps"
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"
        indexes = [
            # Compound indexes for faster lookups
            models.Index(fields=["user", "otp_type", "is_used"]),
            models.Index(fields=["target", "otp_type", "is_used"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.otp_type} for {self.target} - {'Used' if self.is_used else 'Active'}"
