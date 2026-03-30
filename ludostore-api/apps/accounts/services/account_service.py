"""
Account service.

Handles profile management and account operations.
"""

import logging
from typing import Dict

from django.core.exceptions import ValidationError
from django.utils import timezone

from common.utils.mask import mask_email

from ..models import User, UserAccount
from ..utils.security_utils import validate_and_hash_password

logger = logging.getLogger(__name__)


class AccountService:
    """
    Account management service.

    Handles profile updates and password changes.
    """

    @staticmethod
    def update_profile(account: UserAccount, data: Dict) -> UserAccount:
        """
        Update user profile information.

        Args:
            account: UserAccount instance
            data: Dictionary with fields to update

        Returns:
            Updated UserAccount instance
        """
        # Only allow updates to specific fields
        allowed_fields = ["first_name", "last_name", "phone_number"]

        for field in allowed_fields:
            if field in data and data[field] is not None:
                setattr(account, field, data[field])

        if allowed_fields:
            account.save(update_fields=allowed_fields)

        return account

    @staticmethod
    def change_password(user: User, current_password: str, new_password: str) -> bool:
        """
        Change user password.

        Args:
            user: User instance
            current_password: Current password for verification
            new_password: New password to set

        Returns:
            bool: True if successful

        Raises:
            ValidationError: If current password is incorrect or new password invalid
        """
        # Verify current password
        if not user.check_password(current_password):
            raise ValidationError({"current_password": "Current password is incorrect"})

        # Validate new password
        validate_and_hash_password(new_password, user)

        # Set new password
        user.set_password(new_password)
        user.save(update_fields=["password"])

        # Update last password change timestamp in account
        user.account.last_password_change = timezone.now()
        user.account.save(update_fields=["last_password_change"])

        logger.info(f"Password changed for user: {mask_email(user.email)}")
        return True
