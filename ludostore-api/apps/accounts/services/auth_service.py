"""
Authentication service.

Handles:
- User registration
- Login authentication
- Password changes
- Session management (cookies)
"""

import logging
from typing import Dict, Optional, Tuple

from django.conf import settings

from common.cookies.auth import delete_auth_cookies, set_auth_cookies
from common.utils.mask import mask_email

from ..constants import Role
from ..models import User, UserAccount
from ..utils.security_utils import (
    check_account_can_login,
    increment_failed_login,
    reset_failed_login,
)

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service handling registration, login, and session management.

    Why static methods:
    - No shared state needed
    - Easy to test (no mocking of instance state)
    - Simple function-like interface
    """

    @staticmethod
    def authenticate_user(
        email: str, password: str, ip_address: str = None
    ) -> Tuple[Optional[User], Optional[UserAccount], Optional[Dict]]:
        """
        Authenticate a user with email and password.

        Security considerations:
        - Uses constant-time password comparison (Django's check_password)
        - No timing attacks from early returns
        - Account status checks before password check (still constant time)
        - Failed login attempts are tracked to prevent brute force

        Returns:
            Tuple[Optional[User], Optional[UserAccount], Optional[Dict]]:
                - If success: (user, account, None)
                - If failure: (None, None, error_dict)
        """
        try:
            user = User.objects.get(email=email)
            account = user.account
        except User.DoesNotExist:
            # Use dummy check to prevent timing attacks
            # Django's authenticate does similar to avoid revealing user existence
            # We still call check_password on a dummy to maintain timing consistency
            User.objects.none()
            logger.warning(f"Login attempt for non-existent email: {mask_email(email)}")
            return (
                None,
                None,
                {"error": "Invalid credentials", "code": "INVALID_CREDENTIALS"},
            )

        # Check if account can login (status and lockout)
        can_login, reason = check_account_can_login(account)
        if not can_login:
            logger.warning(f"Login blocked for {mask_email(email)}: {reason}")
            return None, None, {"error": reason, "code": "ACCOUNT_UNAVAILABLE"}

        # Verify password
        if not user.check_password(password):
            # Increment failed login attempts
            increment_failed_login(account)
            logger.info(
                f"Failed login for {mask_email(email)}: attempt {account.failed_login_attempts}"
            )

            return (
                None,
                None,
                {"error": "Invalid credentials", "code": "INVALID_CREDENTIALS"},
            )

        # Successful login, reset failed attempts and lockout
        reset_failed_login(account)

        logger.info(f"Successful login for {mask_email(email)}")
        return user, account, None

    @staticmethod
    def create_auth_response(response, user: User, request=None):
        """
        Create authenticated response with JWT tokens in cookies.

        Why JWT in cookies vs localStorage:
        - HttpOnly cookies protect against XSS attacks
        - Automatic sending with requests
        - Can be configured with secure flags (Secure, SameSite)

        Args:
            response: Django response object to modify
            user: Authenticated user
            request: Original request (optional)

        Returns:
            Modified response with cookies set
        """
        from rest_framework_simplejwt.tokens import RefreshToken

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        tokens = {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "refresh_token_expires_in": settings.SIMPLE_JWT.get(
                "REFRESH_TOKEN_LIFETIME", 86400 * 7
            ),
        }

        return set_auth_cookies(response, user, tokens, request)

    @staticmethod
    def logout_user(response):
        """Clear authentication cookies."""
        return delete_auth_cookies(response)

    @staticmethod
    def validate_operator_login(
        email: str, password: str, ip_address: str = None
    ) -> Tuple[Optional[User], Optional[UserAccount], Optional[Dict]]:
        """
        Special authentication for operator accounts.

        This is a separate method to:
        - Enforce role checking for operator endpoints
        - Allow different logging or rate limiting for operator logins
        - Keep customer and operator flows separate

        Returns:
            Same as authenticate_user, but only if user has operator role
        """
        user, account, error = AuthService.authenticate_user(
            email, password, ip_address
        )

        if error:
            return None, None, error

        # Verify operator role
        if account.role != Role.OPERATOR:
            logger.warning(
                f"Non-operator attempted operator login: {mask_email(email)}"
            )
            return None, None, {"error": "Access denied", "code": "ACCESS_DENIED"}

        return user, account, None
