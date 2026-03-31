"""
Email service that provides a clean interface for sending emails.
This service calls the Celery task for async execution.
"""

import logging
from typing import Dict, Optional

from django.conf import settings

from ..tasks import send_email_task

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service that handles all email sending.

    This service provides a clean interface and calls the Celery task.
    All email sending should go through this service.
    """

    @staticmethod
    def send_email(
        subject: str,
        to: str,
        template_name: Optional[str] = None,
        context: Optional[Dict] = None,
        plain_message: Optional[str] = None,
        html_message: Optional[str] = None,
    ) -> None:
        """
        Send an email (async via Celery).

        Args:
            subject: Email subject
            to: Recipient email address
            template_name: Path to HTML template (optional)
            context: Context for template rendering (optional)
            plain_message: Plain text message (optional)
            html_message: Direct HTML message (optional)
        """
        send_email_task.delay(
            subject=subject,
            to=to,
            template_name=template_name,
            context=context,
            plain_message=plain_message,
            html_message=html_message,
        )

        logger.info(f"Email queued: {subject} -> {to}")

    @staticmethod
    def send_verification_email(email: str, token: str, user_name: str = "") -> None:
        """
        Send email verification email with full URL.

        Args:
            email: Recipient email address
            token: 32-character verification token
            user_name: User's name for personalization
        """
        # Build full verification URL
        frontend_url = settings.FRONTEND_URL
        verification_url = f"{frontend_url}/auth/verify-account?token={token}"

        EmailService.send_email(
            subject="Verify Your Email Address - LudoStore",
            to=email,
            template_name="emails/email_verification.html",
            context={
                "user_name": user_name if user_name else "there",
                "verification_url": verification_url,
                "expiry_hours": 60,
            },
        )

    @staticmethod
    def send_password_reset_email(email: str, token: str, user_name: str = "") -> None:
        """
        Send password reset email with full URL.

        Args:
            email: Recipient email address
            token: 32-character reset token
            user_name: User's name for personalization
        """
        # Build full password reset URL
        frontend_url = settings.FRONTEND_URL
        reset_url = f"{frontend_url}/auth/reset-password?token={token}"

        EmailService.send_email(
            subject="Reset Your Password - LudoStore",
            to=email,
            template_name="emails/password_reset.html",
            context={
                "user_name": user_name if user_name else "there",
                "reset_url": reset_url,
                "expiry_minutes": 60,  # From OTPType.CONFIG
            },
        )

    @staticmethod
    def send_welcome_email(email: str, user_name: str = "") -> None:
        """Send welcome email."""
        EmailService.send_email(
            subject="Welcome to LudoStore! 🎉",
            to=email,
            template_name="emails/welcome.html",
            context={
                "user_name": user_name if user_name else "there",
                "email": email,
            },
        )

    @staticmethod
    def send_login_otp_email(email: str, otp_code: str, user_name: str = "") -> None:
        """
        Send login OTP email (6-digit code).

        Args:
            email: Recipient email address
            otp_code: 6-digit login code
            user_name: User's name for personalization
        """
        EmailService.send_email(
            subject="Your Login Code - LudoStore",
            to=email,
            template_name="emails/login_otp.html",
            context={
                "user_name": user_name if user_name else "there",
                "otp_code": otp_code,
                "expiry_minutes": 5,
            },
        )

    @staticmethod
    def send_order_confirmation_email(
        email: str, order_data, user_name: str = ""
    ) -> None:
        """Send order confirmation email."""
        frontend_url = settings.FRONTEND_URL

        EmailService.send_email(
            subject=f"Order Confirmation - {order_data.get('order_number')}",
            to=email,
            template_name="emails/order_confirmation.html",
            context={
                "user_name": user_name if user_name else "there",
                "order": order_data,
                "order_items": order_data.get("items", []),
                "frontend_url": frontend_url,
            },
        )
