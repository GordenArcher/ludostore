"""
Celery task for sending emails.
This is the only task - it handles all email sending.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
    retry_backoff=True,
)
def send_email_task(
    self,
    subject: str,
    to: str,
    template_name: str = None,
    context: dict = None,
    plain_message: str = None,
    html_message: str = None,
):
    """
    Generic Celery task to send emails.

    This is the ONLY email task - all email sending goes through here.
    """
    try:
        # If template is provided, render it
        if template_name and context:
            html_message = render_to_string(template_name, context)
            plain_message = strip_tags(html_message)

        # Send the email
        send_mail(
            subject=subject,
            message=plain_message or "",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"Email sent to {to}: {subject}")
        return True

    except Exception as e:
        logger.exception(f"Failed to send email to {to}: {e}")
        raise self.retry(exc=e)
