"""
Cart service layer.
"""

import logging
from typing import Optional
from uuid import UUID

from django.db import transaction

from .models import Cart, CartItem

logger = logging.getLogger(__name__)


class CartService:
    """
    Service for cart operations.
    """

    @staticmethod
    def get_or_create_cart(user):
        """
        Get existing cart or create one for the user.
        """
        cart, created = Cart.objects.get_or_create(user=user)
        return cart

    @staticmethod
    def add_item(user, product_id: UUID, quantity: int = 1) -> Optional[CartItem]:
        """
        Add a product to cart.
        - If product already in cart, increases quantity
        - Checks stock availability before adding
        - Saves current product price as snapshot

        Returns:
            CartItem: The created or updated cart item
        """
        from apps.products.models import Product

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return None

        # Check stock availability
        if product.stock_quantity < quantity:
            return None

        cart = CartService.get_or_create_cart(user)

        with transaction.atomic():
            # Check if item already exists
            try:
                item = CartItem.objects.get(cart=cart, product=product)
                # Update quantity
                new_quantity = item.quantity + quantity

                # Check stock again with new quantity
                if product.stock_quantity < new_quantity:
                    return None

                item.quantity = new_quantity
                item.save(update_fields=["quantity", "updated_at"])
                logger.info(
                    f"Cart item quantity updated: user={user.id}, product={product_id}, quantity={new_quantity}"
                )
                return item

            except CartItem.DoesNotExist:
                # Create new item with price snapshot
                current_price = product.current_price

                item = CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=quantity,
                    price_at_add=current_price,
                )
                logger.info(
                    f"Item added to cart: user={user.id}, product={product_id}, quantity={quantity}"
                )
                return item

    @staticmethod
    def update_item_quantity(user, item_id: UUID, quantity: int) -> Optional[CartItem]:
        """
        Update quantity of a cart item.

        Returns:
            CartItem: The updated item, or None if not found or stock insufficient
        """
        try:
            cart = Cart.objects.get(user=user)
            item = CartItem.objects.get(id=item_id, cart=cart)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return None

        # Check stock availability
        if item.product.stock_quantity < quantity:
            return None

        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
        logger.info(
            f"Cart item quantity updated: user={user.id}, item={item_id}, quantity={quantity}"
        )
        return item

    @staticmethod
    def remove_item(user, item_id: UUID) -> bool:
        """
        Remove an item from cart.

        Returns:
            bool: True if removed, False if not found
        """
        try:
            cart = Cart.objects.get(user=user)
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            logger.info(f"Item removed from cart: user={user.id}, item={item_id}")
            return True
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return False

    @staticmethod
    def remove_product(user, product_id: UUID) -> bool:
        """
        Remove a product from cart by product ID.

        Returns:
            bool: True if removed, False if not found
        """
        try:
            cart = Cart.objects.get(user=user)
            item = CartItem.objects.get(cart=cart, product_id=product_id)
            item.delete()
            logger.info(
                f"Product removed from cart: user={user.id}, product={product_id}"
            )
            return True
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return False

    @staticmethod
    def clear_cart(user) -> int:
        """
        Remove all items from user's cart.

        Returns:
            int: Number of items removed
        """
        try:
            cart = Cart.objects.get(user=user)
            count = cart.items.count()
            cart.items.all().delete()
            logger.info(f"Cart cleared: user={user.id}, items={count}")
            return count
        except Cart.DoesNotExist:
            return 0

    @staticmethod
    def get_cart(user):
        """
        Get user's cart with items.
        """
        return CartService.get_or_create_cart(user)

    @staticmethod
    def get_cart_item_count(user) -> int:
        """
        Get total number of items in cart.
        """
        try:
            cart = Cart.objects.get(user=user)
            return cart.total_items
        except Cart.DoesNotExist:
            return 0
