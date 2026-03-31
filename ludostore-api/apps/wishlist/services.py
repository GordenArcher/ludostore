"""
Wishlist service layer.
"""

import logging
from typing import Optional
from uuid import UUID

from django.db import transaction

from .models import Wishlist, WishlistItem

logger = logging.getLogger(__name__)


class WishlistService:
    """
    Service for wishlist operations.
    """

    @staticmethod
    def get_or_create_wishlist(user):
        """
        Get existing wishlist or create one for the user.
        """
        wishlist, created = Wishlist.objects.get_or_create(user=user)
        return wishlist

    @staticmethod
    def add_item(user, product_id: UUID, notes: str = "") -> Optional[WishlistItem]:
        """
        Add a product to user's wishlist.

        Returns:
            WishlistItem: The created item, or None if product already exists
        """
        from apps.products.models import Product

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return None

        wishlist = WishlistService.get_or_create_wishlist(user)

        # Check if product already in wishlist
        if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
            return None

        with transaction.atomic():
            item = WishlistItem.objects.create(
                wishlist=wishlist, product=product, notes=notes
            )
            logger.info(f"Item added to wishlist: user={user.id}, product={product_id}")
            return item

    @staticmethod
    def remove_item(user, item_id: UUID) -> bool:
        """
        Remove an item from wishlist.

        Returns:
            bool: True if removed, False if not found
        """
        try:
            wishlist = Wishlist.objects.get(user=user)
            item = WishlistItem.objects.get(id=item_id, wishlist=wishlist)
            item.delete()
            logger.info(f"Item removed from wishlist: user={user.id}, item={item_id}")
            return True
        except (Wishlist.DoesNotExist, WishlistItem.DoesNotExist):
            return False

    @staticmethod
    def remove_product(user, product_id: UUID) -> bool:
        """
        Remove a product from wishlist by product ID.

        Returns:
            bool: True if removed, False if not found
        """
        try:
            wishlist = Wishlist.objects.get(user=user)
            item = WishlistItem.objects.get(wishlist=wishlist, product_id=product_id)
            item.delete()
            logger.info(
                f"Product removed from wishlist: user={user.id}, product={product_id}"
            )
            return True
        except (Wishlist.DoesNotExist, WishlistItem.DoesNotExist):
            return False

    @staticmethod
    def clear_wishlist(user) -> int:
        """
        Remove all items from user's wishlist.

        Returns:
            int: Number of items removed
        """
        try:
            wishlist = Wishlist.objects.get(user=user)
            count = wishlist.items.count()
            wishlist.items.all().delete()
            logger.info(f"Wishlist cleared: user={user.id}, items={count}")
            return count
        except Wishlist.DoesNotExist:
            return 0

    @staticmethod
    def get_wishlist(user):
        """
        Get user's wishlist with items.
        """
        return WishlistService.get_or_create_wishlist(user)

    @staticmethod
    def is_in_wishlist(user, product_id: UUID) -> bool:
        """
        Check if a product is in user's wishlist.
        """
        try:
            wishlist = Wishlist.objects.get(user=user)
            return WishlistItem.objects.filter(
                wishlist=wishlist, product_id=product_id
            ).exists()
        except Wishlist.DoesNotExist:
            return False

    @staticmethod
    def update_item_notes(user, item_id: UUID, notes: str) -> Optional[WishlistItem]:
        """
        Update notes for a wishlist item.

        Returns:
            WishlistItem: The updated item, or None if not found
        """
        try:
            wishlist = Wishlist.objects.get(user=user)
            item = WishlistItem.objects.get(id=item_id, wishlist=wishlist)
            item.notes = notes
            item.save(update_fields=["notes"])
            logger.info(f"Wishlist item notes updated: user={user.id}, item={item_id}")
            return item
        except (Wishlist.DoesNotExist, WishlistItem.DoesNotExist):
            return None
