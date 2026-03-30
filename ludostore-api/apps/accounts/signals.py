"""
Signals for Account models.

Handles automatic account creation when User is created.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User, UserAccount

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_account(sender, instance, created, **kwargs):
    """
    Automatically create a UserAccount when a new User is created.

    Why signal instead of service:
    - Ensures UserAccount is always created when User is created
    - No matter where User creation happens (admin, registration, etc.)
    - Keeps User creation clean without needing to manually create account

    Args:
        sender: The model class (User)
        instance: The actual User instance being saved
        created: Boolean - True if this is a new record
        kwargs: Additional keyword arguments
    """
    if created:
        UserAccount.objects.create(user=instance)
        logger.info(f"UserAccount created for user: {instance.email}")
