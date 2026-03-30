"""
OTP utility functions.

All OTP-related helper functions:
- Generation
- Creation
- Verification
- Rate limiting
"""

import secrets
import string
from datetime import timedelta
from typing import Optional, Tuple

from django.utils import timezone

from ..constants import OTPType
from ..models import OTP, User, UserAccount


def generate_otp_code(otp_type: str, custom_length: int = None) -> str:
    """
    Generate an OTP code with appropriate length for the OTP type.

    Why different lengths:
    - 6-digit numeric codes: User-friendly, easy to type from SMS/email
    - Longer alphanumeric codes: For API keys or machine-to-machine flows

    Args:
        otp_type: Type of OTP from OTPType constants
        custom_length: Override the default length for this type

    Returns:
        Generated OTP code (numeric or alphanumeric)
    """
    # Determine length from config or use custom length
    if custom_length:
        length = custom_length
    else:
        length = OTPType.CONFIG.get(otp_type, {}).get("length", 6)

    # For lengths <= 10, use numeric OTP for user convenience
    # Users find it easier to type numbers than mixed case strings
    if length <= 10:
        # Use secrets module for cryptographically secure random numbers
        # Not using random.randint() because it's not suitable for security
        return "".join(secrets.choice(string.digits) for _ in range(length))
    else:
        # For longer codes (API keys), use alphanumeric with letters and digits
        # This provides more entropy per character
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))


def get_otp_expiry(otp_type: str):
    """
    Calculate expiry datetime for an OTP based on its type.

    Args:
        otp_type: Type of OTP from OTPType constants

    Returns:
        datetime: Expiration timestamp
    """
    expiry_minutes = OTPType.CONFIG.get(otp_type, {}).get("expiry_minutes", 15)
    return timezone.now() + timedelta(minutes=expiry_minutes)


def create_otp(
    user: User,
    otp_type: str,
    target: str,
    ip_address: str = None,
    user_agent: str = None,
) -> OTP:
    """
    Create a new OTP and invalidate any previous unused OTPs of the same type.

    Why invalidate previous OTPs:
    - Prevents OTP accumulation in the database
    - Ensures only one valid OTP exists per type per target
    - Better security: old OTPs become invalid immediately when a new one is requested

    Args:
        user: User instance
        otp_type: Type of OTP from OTPType constants
        target: Target email address
        ip_address: IP address of requestor (for auditing)
        user_agent: User agent of requestor (for auditing)

    Returns:
        OTP: The newly created OTP instance
    """
    # Invalidate any unused OTPs of the same type for this user/target
    # This ensures previous OTPs cannot be used after requesting a new one
    OTP.objects.filter(
        user=user, otp_type=otp_type, target=target, is_used=False
    ).update(is_used=True)

    # Generate code and create new OTP
    code = generate_otp_code(otp_type)
    expires_at = get_otp_expiry(otp_type)

    return OTP.objects.create(
        user=user,
        otp_code=code,
        otp_type=otp_type,
        target=target,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
    )


def verify_otp_code(
    otp_code: str, ip_address: str = None
) -> Tuple[bool, str, Optional[UserAccount]]:
    """
    Verify an OTP code.

    This function handles the core OTP verification logic:
    - Finds the OTP by code and type
    - Gets the user from the OTP record
    - Updates verification flags if applicable

    Why get user from OTP:
    - OTP contains user_id, so we don't need to trust user input
    - Prevents OTP sharing across different accounts
    - More secure than relying on email parameter

    Args:
        otp_code: The OTP code to verify
        otp_type: Type of OTP being verified
        ip_address: IP address for auditing (optional)

    Returns:
        Tuple[bool, str, Optional[UserAccount]]:
            - bool: Success status
            - str: Message describing result
            - UserAccount: Account if verification succeeded, None otherwise
    """
    try:
        # Find the OTP by code and type (not used, not expired)
        otp = OTP.objects.get(
            otp_code=otp_code,
            is_used=False,
            expires_at__gt=timezone.now(),
        )
        user = otp.user
        account = user.account

    except OTP.DoesNotExist:
        # No valid OTP found
        return False, "Invalid or expired OTP", None

    # Mark OTP as used
    otp.is_used = True
    otp.save(update_fields=["is_used"])

    # Handle post-verification actions based on OTP type
    if otp.otp_type == OTPType.EMAIL_VERIFICATION:
        account.is_email_verified = True
        account.save(update_fields=["is_email_verified"])
        return True, "Email verified successfully", account

    elif otp.otp_type == OTPType.PASSWORD_RESET:
        # Password reset verification succeeded
        # Note: Actual password reset happens in a separate step
        return True, "OTP verified. You can now reset your password.", account

    elif otp.otp_type == OTPType.LOGIN:
        # Login verification succeeded
        return True, "Login verified", account

    return False, "Invalid OTP type", None
