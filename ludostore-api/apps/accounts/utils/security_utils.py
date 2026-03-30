"""
Security utility functions.

Handles password validation, account status checks, etc.
"""

from datetime import timedelta
from typing import Optional, Tuple

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone

from ..constants import AccountStatus, AuthLimits, Role
from ..models import User, UserAccount


def validate_and_hash_password(password: str, user: User = None) -> str:
    """
    Validate password strength and return the hashed password.

    Args:
        password: Plain text password
        user: User instance (optional, for user-specific validation)

    Returns:
        str: Hashed password (if validation passes)

    Raises:
        ValidationError: If password fails validation
    """
    try:
        validate_password(password, user)
    except ValidationError as e:
        raise ValidationError({"password": e.messages})

    # Password is valid, but we don't hash it here
    # That's handled by Django's set_password method
    return password


def check_account_can_login(account: UserAccount) -> Tuple[bool, Optional[str]]:
    """
    Check if an account is allowed to log in.

    Args:
        account: UserAccount instance

    Returns:
        Tuple[bool, Optional[str]]:
            - bool: True if allowed, False otherwise
            - str: Reason if not allowed
    """
    # Check account status
    if account.account_status not in AccountStatus.ALLOW_LOGIN:
        return False, f"Account is {account.account_status}"

    # Check if account is temporarily locked
    if account.locked_until and account.locked_until > timezone.now():
        lockout_remaining = (account.locked_until - timezone.now()).seconds // 60
        return False, f"Account locked. Try again in {lockout_remaining} minutes"

    if not account.is_email_verified:
        return (
            False,
            "Email is not verified. Please verify your email before logging in.",
        )

    return True, None


def increment_failed_login(account: UserAccount) -> None:
    """
    Increment failed login attempts and lock account if threshold reached.

    Args:
        account: UserAccount instance
    """
    account.failed_login_attempts += 1

    # Lock account if threshold reached
    if account.failed_login_attempts >= AuthLimits.FAILED_LOGIN_LIMIT:
        account.locked_until = timezone.now() + timedelta(
            minutes=AuthLimits.LOCKOUT_MINUTES
        )

    account.save(update_fields=["failed_login_attempts", "locked_until"])


def reset_failed_login(account: UserAccount) -> None:
    """
    Reset failed login attempts after successful login.

    Args:
        account: UserAccount instance
    """
    account.failed_login_attempts = 0
    account.locked_until = None
    account.save(update_fields=["failed_login_attempts", "locked_until"])


def is_operator(user: User) -> bool:
    """
    Check if a user has operator privileges.

    Args:
        user: User instance

    Returns:
        bool: True if operator, False otherwise
    """
    return hasattr(user, "account") and user.account.role == Role.OPERATOR
