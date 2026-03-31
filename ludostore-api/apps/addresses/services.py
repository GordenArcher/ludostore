"""
Address service layer.

Handles business logic for addresses:
- Ensuring only one default per user per type
- Soft delete
- Pagination
"""

import logging
from typing import Dict, Optional

from django.core.paginator import Paginator
from django.db import transaction

from .models import Address

logger = logging.getLogger(__name__)


class AddressService:
    """
    Service for address operations.
    """

    @staticmethod
    def create_address(user, data: Dict) -> Address:
        """
        Create a new address for a user.

        Args:
            user: The user creating the address
            data: Dictionary with address fields

        Returns:
            Address: The created address
        """
        with transaction.atomic():
            address = Address.objects.create(user=user, **data)
            logger.info(f"Address created for user {user.id}: {address.id}")
            return address

    @staticmethod
    def update_address(address: Address, data: Dict) -> Address:
        """
        Update an existing address.

        Args:
            address: The address to update
            data: Dictionary with fields to update

        Returns:
            Address: The updated address
        """
        with transaction.atomic():
            for field, value in data.items():
                setattr(address, field, value)
            address.save()
            logger.info(f"Address updated: {address.id}")
            return address

    @staticmethod
    def delete_address(address: Address) -> None:
        """
        Soft delete an address.

        Args:
            address: The address to delete
        """
        address.is_deleted = True
        address.save(update_fields=["is_deleted"])
        logger.info(f"Address soft deleted: {address.id}")

    @staticmethod
    def set_default_address(
        user, address_id: int, address_type: str = None
    ) -> Optional[Address]:
        """
        Set an address as default.

        Args:
            user: The user
            address_id: ID of the address to set as default
            address_type: Optional - if provided, change the address type

        Returns:
            Address: The updated address
        """
        try:
            address = Address.objects.get(id=address_id, user=user, is_deleted=False)
        except Address.DoesNotExist:
            return None

        # If address_type is provided, update it
        if address_type and address_type in Address.AddressType.values:
            address.address_type = address_type

        address.is_default = True
        address.save()

        logger.info(f"Default address set: {address.id} for user {user.id}")
        return address

    @staticmethod
    def get_user_addresses(user, page: int = 1, page_size: int = 20):
        """
        Get paginated list of user addresses.

        Args:
            user: The user
            page: Page number (1-indexed)
            page_size: Number of items per page

        Returns:
            tuple: (addresses_list, total_count, has_next, has_prev)
        """
        addresses = Address.objects.filter(user=user, is_deleted=False)

        paginator = Paginator(addresses, page_size)
        page_obj = paginator.get_page(page)

        return {
            "items": list(page_obj.object_list),
            "total": paginator.count,
            "page": page,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "has_next": page_obj.has_next(),
            "has_prev": page_obj.has_previous(),
        }
