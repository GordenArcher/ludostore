"""
OTP service.

Handles OTP request and verification with rate limiting.
"""

import logging
from typing import Dict, Optional, Tuple

from apps.notifications.services.email_service import EmailService
from common.utils.mask import mask_email

from ..constants import AuthLimits, OTPType
from ..models import User, UserAccount
from ..utils.otp_utils import create_otp, verify_otp_code
from ..utils.rate_limit_utils import check_rate_limit

logger = logging.getLogger(__name__)


class OTPService:
    """
    OTP management service.

    Handles OTP generation, sending, verification with proper rate limiting.
    All operations are atomic and secure.
    """

    @staticmethod
    def request_otp(
        email: str, otp_type: str, ip_address: str = None, user_agent: str = None
    ) -> Tuple[bool, Optional[Dict], Optional[Dict]]:
        """
        Request an OTP for verification.

        Security considerations:
        - Always returns success even if email doesn't exist (prevents email enumeration)
        - Rate limiting per email per OTP type
        - Previous OTPs are invalidated automatically
        - Metadata (IP, user agent) captured for auditing

        Args:
            email: Target email address
            otp_type: Type of OTP from OTPType constants
            ip_address: Requestor's IP for auditing
            user_agent: Requestor's user agent for auditing

        Returns:
            Tuple[bool, Optional[Dict], Optional[Dict]]:
                - bool: Success status
                - Dict: Success data (message)
                - Dict: Error data if failed
        """
        # Check rate limits before anything else
        # This prevents abuse of the OTP endpoint
        rate_limited, rate_data = check_rate_limit(
            key_prefix=f"otp_request_{otp_type}",
            identifier=email,
            max_attempts=AuthLimits.OTP_REQUEST_ATTEMPTS,
            window_seconds=AuthLimits.OTP_REQUEST_WINDOW_SECONDS,
        )

        if rate_limited:
            logger.warning(
                f"OTP rate limit exceeded for {mask_email(email)}: {otp_type}"
            )
            return (
                False,
                None,
                {
                    "error": "Too many OTP requests",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "rate_limit": rate_data,
                },
            )

        try:
            user = User.objects.get(email=email)
            account = user.account  # Get account for user_name
        except User.DoesNotExist:
            # Always return success to prevent email enumeration
            # Even though we didn't send an OTP, we don't reveal that
            logger.info(f"OTP requested for non-existent email: {mask_email(email)}")
            return True, {"message": "OTP sent successfully"}, None

        # Create OTP
        otp = create_otp(user, otp_type, email, ip_address, user_agent)

        # Build user_name for email personalization
        user_name = (
            f"{account.first_name} {account.last_name}".strip() or email.split("@")[0]
        )

        # Send email based on OTP type
        if otp_type == OTPType.EMAIL_VERIFICATION:
            EmailService.send_verification_email(email, otp.otp_code, user_name)
        elif otp_type == OTPType.PASSWORD_RESET:
            EmailService.send_password_reset_email(email, otp.otp_code, user_name)
        elif otp_type == OTPType.LOGIN:
            EmailService.send_login_otp_email(email, otp.otp_code, user_name)

        logger.info(
            f"OTP sent to {mask_email(email)}: {otp.otp_code} (type: {otp_type})"
        )

        return True, {"message": "OTP sent successfully"}, None

    @staticmethod
    def verify_otp(
        otp_code: str, ip_address: str = None
    ) -> Tuple[bool, Optional[Dict], Optional[Dict], Optional[UserAccount]]:
        """
        Verify an OTP code.

        Args:
            otp_code: OTP code to verify
            otp_type: Type of OTP being verified
            ip_address: Requestor's IP for auditing

        Returns:
            Tuple[bool, Optional[Dict], Optional[Dict], Optional[UserAccount]]:
                - bool: Success status
                - Dict: Success data (message, optional data)
                - Dict: Error data if failed
                - UserAccount: Account if verification succeeded, None otherwise
        """
        # Check rate limits for verification attempts
        rate_limited, rate_data = check_rate_limit(
            key_prefix=f"otp_verify_{otp_code}",
            identifier=f"{otp_code}",
            max_attempts=AuthLimits.OTP_VERIFY_ATTEMPTS,
            window_seconds=AuthLimits.OTP_VERIFY_WINDOW_SECONDS,
        )

        if rate_limited:
            logger.warning(f"OTP verify rate limit exceeded for {otp_code} code")
            return (
                False,
                None,
                {
                    "error": f"Too many attempts. Try again in {rate_data['retry_after']} seconds",
                    "code": "RATE_LIMIT_EXCEEDED",
                },
                None,
            )

        # Verify the OTP
        success, message, account = verify_otp_code(otp_code, ip_address)

        if not success:
            return False, None, {"error": message, "code": "INVALID_OTP"}, None

        return True, {"message": message}, None, account
