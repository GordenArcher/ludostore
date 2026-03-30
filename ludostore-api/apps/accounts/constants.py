"""
Account app constants.

Centralized configuration for all account-related constants.
This ensures consistency across the entire module and makes
configuration changes easy to manage.

Why separate constants:
- Single source of truth for all configuration values
- Easy to modify OTP lengths, expiry times, etc. without touching business logic
- Prevents magic numbers scattered throughout the codebase
"""

from django.utils.translation import gettext_lazy as _


class Role:
    """
    User role definitions.

    Why "operator" instead of "admin":
    - Security through obscurity - makes admin endpoints harder to guess
    - "operator" is less obvious to automated scanners
    - Under the hood, operators still use Django's is_staff flag for admin panel access
    """

    CUSTOMER = "customer"  # Regular e-commerce users
    OPERATOR = "operator"  # Staff/admin users (uses is_staff=True under the hood)

    CHOICES = [
        (CUSTOMER, _("Customer")),
        (OPERATOR, _("Operator")),
    ]


class AccountStatus:
    """
    Account lifecycle statuses.

    Different statuses represent different account states:
    - ACTIVE: Normal functioning account
    - SUSPENDED: Temporarily disabled (can be reactivated)
    - BLOCKED: Permanently disabled (requires admin intervention)
    - DEACTIVATED: User voluntarily deactivated
    """

    ACTIVE = "active"
    SUSPENDED = "suspended"
    BLOCKED = "blocked"
    DEACTIVATED = "deactivated"

    CHOICES = [
        (ACTIVE, _("Active")),
        (SUSPENDED, _("Suspended")),
        (BLOCKED, _("Blocked")),
        (DEACTIVATED, _("Deactivated")),
    ]

    # Statuses that allow login - only ACTIVE accounts can log in
    ALLOW_LOGIN = [ACTIVE]


class OTPType:
    """
    OTP types for different verification flows.

    Each type can have different security requirements:
    - 6-digit for login (user convenience)
    - 32-character for email verification and password reset (more secure for links)
    """
    EMAIL_VERIFICATION = 'email_verification'
    PASSWORD_RESET = 'password_reset'
    LOGIN = 'login'

    CHOICES = [
        (EMAIL_VERIFICATION, 'Email Verification'),
        (PASSWORD_RESET, 'Password Reset'),
        (LOGIN, 'Login'),
    ]

    # Configuration per OTP type
    CONFIG = {
        EMAIL_VERIFICATION: {
            'length': 32,           # 32-character alphanumeric for URL
            'expiry_minutes': 1440,  # 24 hours for email verification
            'description': 'Email verification - 24 hours to verify'
        },
        PASSWORD_RESET: {
            'length': 32,           # 32-character alphanumeric for URL
            'expiry_minutes': 60,    # 1 hour for password reset
            'description': 'Password reset - 1 hour to reset'
        },
        LOGIN: {
            'length': 6,            # 6-digit numeric for login
            'expiry_minutes': 5,     # 5 minutes for login
            'description': 'Login verification - 5 minutes to complete'
        },
    }

class AuthLimits:
    """
    Authentication security limits.

    These limits help prevent brute force attacks and account abuse.
    """

    # Maximum failed login attempts before account lockout
    FAILED_LOGIN_LIMIT = 5

    # Duration (in minutes) that account remains locked after too many failures
    LOCKOUT_MINUTES = 30

    # Rate limiting for OTP requests (per email per OTP type)
    OTP_REQUEST_ATTEMPTS = 3  # Number of attempts allowed
    OTP_REQUEST_WINDOW_SECONDS = 900  # 15 minutes window

    # Rate limiting for OTP verification attempts
    OTP_VERIFY_ATTEMPTS = 5  # Number of attempts allowed
    OTP_VERIFY_WINDOW_SECONDS = 900  # 15 minutes window
