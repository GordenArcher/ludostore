"""
Product service layer.

Handles business logic with role-based access control.
"""

import logging
from decimal import Decimal
from typing import Dict, List, Optional
from uuid import UUID

from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from apps.accounts.constants import Role
from apps.products.serializers import CategorySerializer

from .models import Category, Product, ProductImage

logger = logging.getLogger(__name__)


class ProductService:
    """
    Service for product operations with role checks.
    """

    @staticmethod
    def create_product(user, data: Dict) -> Product:
        """
        Create a new product.

        Args:
            user: The user creating the product (must be operator)
            data: Dictionary with product fields

        Returns:
            Product: The created product

        Raises:
            PermissionError: If user is not operator
        """
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can create products")

        with transaction.atomic():
            product = Product.objects.create(created_by=user, **data)
            logger.info(f"Product created by {user.email}: {product.id}")
            return product

    @staticmethod
    def update_product(user, product: Product, data: Dict) -> Optional[Product]:
        """
        Update an existing product.

        Args:
            user: The user updating the product (must be operator)
            product_id: ID of the product to update
            data: Dictionary with fields to update

        Returns:
            Product: The updated product or None if not found

        Raises:
            PermissionError: If user is not operator
        """
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can update products")

        with transaction.atomic():
            for field, value in data.items():
                setattr(product, field, value)
            product.save()
            logger.info(f"Product updated by {user.email}: {product.id}")
            return product

    @staticmethod
    def delete_product(user, product_id: UUID) -> bool:
        """
        Soft delete a product.

        Args:
            user: The user deleting the product (must be operator)
            product_id: ID of the product to delete

        Returns:
            bool: True if deleted, False if not found

        Raises:
            PermissionError: If user is not operator
        """
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can delete products")

        try:
            product = Product.objects.get(id=product_id)
            product.is_active = False
            product.save(update_fields=["is_active"])
            logger.info(f"Product deactivated by {user.email}: {product.id}")
            return True
        except Product.DoesNotExist:
            return False

    @staticmethod
    def get_products(
        page: int = 1,
        page_size: int = 20,
        category_id: UUID = None,
        search: str = None,
        min_price: Decimal = None,
        max_price: Decimal = None,
        in_stock: bool = None,
        featured: bool = None,
        sort: str = None,
        is_active: bool = True,
    ):
        """
        Get paginated list of products with filters and sorting.
        """
        products = Product.objects.filter(is_active=is_active)

        # Apply filters
        if category_id:
            products = products.filter(category_id=category_id)

        if featured is not None:
            products = products.filter(featured=featured)

        if in_stock:
            products = products.filter(stock_quantity__gt=0)

        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # Price range filter
        if min_price is not None:
            products = products.filter(regular_price__gte=min_price)
        if max_price is not None:
            products = products.filter(regular_price__lte=max_price)

        # Apply sorting
        if sort:
            sort_mapping = {
                "price_asc": "regular_price",
                "price_desc": "-regular_price",
                "newest": "-created_at",
                "oldest": "created_at",
                "name_asc": "name",
                "name_desc": "-name",
            }
            if sort in sort_mapping:
                products = products.order_by(sort_mapping[sort])
        else:
            products = products.order_by("-created_at")

        paginator = Paginator(products, page_size)
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

    @staticmethod
    def get_product_by_id(product_id: UUID) -> Optional[Product]:
        """Get a single product by ID."""
        try:
            return Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def enrich_products_with_user_data(products, user):
        """
        Add is_in_wishlist and is_in_cart flags to products for authenticated user.
        """
        if not user or not user.is_authenticated:
            return products

        # Get user's wishlist product IDs
        from apps.wishlist.models import WishlistItem

        wishlist_product_ids = set(
            WishlistItem.objects.filter(wishlist__user=user).values_list(
                "product_id", flat=True
            )
        )

        # Get user's cart items
        from apps.cart.models import Cart

        try:
            cart = Cart.objects.get(user=user)
            cart_items = {
                str(item.product_id): {"id": str(item.id), "quantity": item.quantity}
                for item in cart.items.all()
            }
        except Cart.DoesNotExist:
            cart_items = {}

        # Enrich each product
        for product in products:
            product_id = str(product.id)
            product.is_in_wishlist = product_id in wishlist_product_ids
            if product_id in cart_items:
                product.is_in_cart = True
                product.cart_item_id = cart_items[product_id]["id"]
                product.cart_quantity = cart_items[product_id]["quantity"]
            else:
                product.is_in_cart = False
                product.cart_item_id = None
                product.cart_quantity = 0

        return products

    @staticmethod
    def enrich_product_with_user_data(product, user):
        """
        Add flags to single product for authenticated user.
        """
        if not user or not user.is_authenticated:
            product.is_in_wishlist = False
            product.is_in_cart = False
            product.cart_item_id = None
            product.cart_quantity = 0
            return product

        # Check wishlist
        from apps.wishlist.models import WishlistItem

        product.is_in_wishlist = WishlistItem.objects.filter(
            wishlist__user=user, product_id=product.id
        ).exists()

        # Check cart
        from apps.cart.models import Cart, CartItem

        try:
            cart = Cart.objects.get(user=user)
            cart_item = CartItem.objects.filter(cart=cart, product=product).first()
            if cart_item:
                product.is_in_cart = True
                product.cart_item_id = str(cart_item.id)
                product.cart_quantity = cart_item.quantity
            else:
                product.is_in_cart = False
                product.cart_item_id = None
                product.cart_quantity = 0
        except Cart.DoesNotExist:
            product.is_in_cart = False
            product.cart_item_id = None
            product.cart_quantity = 0

        return product


class CategoryService:
    """
    Service for category operations with role checks.
    """

    @staticmethod
    def create_category(user, data: Dict) -> Category:
        """Create a new category."""
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can create categories")

        category = Category.objects.create(**data)
        logger.info(f"Category created by {user.email}: {category.id}")
        return category

    @staticmethod
    def update_category(user, category_id: UUID, data: Dict) -> Optional[Category]:
        """Update an existing category (operator only)."""

        #  Permission check
        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can update categories")

        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return None

        serializer = CategorySerializer(instance=category, data=data, partial=True)

        try:
            serializer.is_valid(raise_exception=True)
            updated_category = serializer.save()

            logger.info(f"Category updated by {user.email}: {updated_category.id}")

            return updated_category

        except ValidationError as e:
            raise e

    @staticmethod
    def delete_category(user, category_id: UUID) -> bool:
        """Soft delete a category."""
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can delete categories")

        try:
            category = Category.objects.get(id=category_id)
            category.is_active = False
            category.save(update_fields=["is_active"])
            logger.info(f"Category deactivated by {user.email}: {category.id}")
            return True
        except Category.DoesNotExist:
            return False

    @staticmethod
    def get_categories(is_active: bool = True, page: int = 1, page_size: int = 50):
        """Get paginated list of categories."""
        categories = Category.objects.filter(is_active=is_active)

        paginator = Paginator(categories, page_size)
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


class ProductImageService:
    """Service for product image operations."""

    @staticmethod
    def add_image(user, product_id: UUID, data: Dict) -> Optional[ProductImage]:
        """Add an image to a product."""
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can add product images")

        try:
            product = Product.objects.get(id=product_id)
            image = ProductImage.objects.create(product=product, **data)
            return image
        except Product.DoesNotExist:
            return None

    @staticmethod
    def delete_image(user, image_id: UUID) -> bool:
        """Delete a product image."""
        from apps.accounts.constants import Role

        if user.account.role != Role.OPERATOR:
            raise PermissionError("Only operators can delete product images")

        try:
            image = ProductImage.objects.get(id=image_id)
            image.delete()
            return True
        except ProductImage.DoesNotExist:
            return False
