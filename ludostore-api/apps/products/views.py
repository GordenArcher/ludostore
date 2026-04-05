"""
Product views.

Separation of concerns:
- Public endpoints: GET only, no auth required
- Admin endpoints: Full CRUD, operator only
"""

import logging
from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.utils.pagination import get_pagination_params
from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductCreateSerializer,
    ProductSerializer,
    ProductUpdateSerializer,
)
from .services import CategoryService, ProductService

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_categories(request):
    """
    List all active categories.
    Public access no authentication required.
    """
    request_id = generate_request_id()

    try:
        page, page_size = get_pagination_params(request)

        result = CategoryService.get_categories(
            is_active=True, page=page, page_size=page_size
        )

        serializer = CategorySerializer(result["items"], many=True)

        return success_response(
            message="Categories retrieved",
            data={
                "categories": serializer.data,
                "pagination": {
                    "total": result["total"],
                    "page": result["page"],
                    "page_size": result["page_size"],
                    "total_pages": result["total_pages"],
                    "has_next": result["has_next"],
                    "has_prev": result["has_prev"],
                },
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error listing categories: {e}")
        return error_response(
            message="Failed to retrieve categories",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CATEGORY_LIST_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_category(request, category_id):
    """
    Get a single category by ID.
    Public access - no authentication required.
    """
    request_id = generate_request_id()

    try:
        category = Category.objects.get(id=category_id, is_active=True)
        serializer = CategorySerializer(category)
        return success_response(
            message="Category retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Category.DoesNotExist:
        return error_response(
            message="Category not found",
            status_code=status.HTTP_404_NOT_FOUND,
            code="CATEGORY_NOT_FOUND",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving category {category_id}: {e}")
        return error_response(
            message="Failed to retrieve category",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CATEGORY_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def list_products(request):
    """
    List all active products with filters and sorting.

    Query params:
    - page: Page number
    - page_size: Items per page
    - category_id: Filter by category
    - search: Search by name/description
    - min_price: Minimum price
    - max_price: Maximum price
    - in_stock: Filter in stock products (true/false)
    - featured: Filter featured products (true/false)
    - sort: price_asc, price_desc, newest, oldest, name_asc, name_desc
    """
    request_id = generate_request_id()

    try:
        page, page_size = get_pagination_params(request)
        category_id = request.GET.get("category_id")
        search = request.GET.get("search")
        min_price = request.GET.get("min_price")
        max_price = request.GET.get("max_price")
        in_stock = request.GET.get("in_stock")
        featured = request.GET.get("featured")
        sort = request.GET.get("sort")

        # Convert params
        if min_price:
            min_price = Decimal(min_price)
        if max_price:
            max_price = Decimal(max_price)
        if in_stock:
            in_stock = in_stock.lower() == "true"
        if featured:
            featured = featured.lower() == "true"

        result = ProductService.get_products(
            page=page,
            page_size=page_size,
            category_id=category_id,
            search=search,
            min_price=min_price,
            max_price=max_price,
            in_stock=in_stock,
            featured=featured,
            sort=sort,
        )

        # Enrich products with user data if authenticated
        if request.user.is_authenticated:
            products = ProductService.enrich_products_with_user_data(
                result["items"], request.user
            )
        else:
            products = result["items"]

        serializer = ProductSerializer(products, many=True)

        return success_response(
            message="Products retrieved",
            data={
                "products": serializer.data,
                "pagination": {
                    "total": result["total"],
                    "page": result["page"],
                    "page_size": result["page_size"],
                    "total_pages": result["total_pages"],
                    "has_next": result["has_next"],
                    "has_prev": result["has_prev"],
                },
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error listing products: {e}")
        return error_response(
            message="Failed to retrieve products",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PRODUCT_LIST_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_product(request, product_id):
    """
    Get a single product by ID.
    """
    request_id = generate_request_id()

    try:
        product = ProductService.get_product_by_id(product_id)

        if not product:
            return error_response(
                message="Product not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="PRODUCT_NOT_FOUND",
                request_id=request_id,
            )

        # Enrich with user data if authenticated
        if request.user.is_authenticated:
            product = ProductService.enrich_product_with_user_data(
                product, request.user
            )

        serializer = ProductSerializer(product)
        return success_response(
            message="Product retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving product {product_id}: {e}")
        return error_response(
            message="Failed to retrieve product",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PRODUCT_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_category(request):
    """
    Create a new category.
    Operator only.
    """
    request_id = generate_request_id()

    serializer = CategorySerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Category creation failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        category = CategoryService.create_category(
            request.user, serializer.validated_data
        )
        return success_response(
            message="Category created successfully",
            data=CategorySerializer(category).data,
            status_code=status.HTTP_201_CREATED,
            code="CATEGORY_CREATED",
            request_id=request_id,
        )

    except PermissionError as e:
        return error_response(
            message=str(e),
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error creating category: {e}")
        return error_response(
            message="Category creation failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CATEGORY_CREATE_ERROR",
            request_id=request_id,
        )


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def admin_update_category(request, category_id):
    """
    Update a category.
    Operator only.
    """
    request_id = generate_request_id()

    try:
        category = CategoryService.update_category(
            user=request.user,
            category_id=category_id,
            data=request.data,
        )

        if not category:
            return error_response(
                message="Category not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="CATEGORY_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Category updated successfully",
            data=CategorySerializer(category).data,
            status_code=status.HTTP_200_OK,
            code="CATEGORY_UPDATED",
            request_id=request_id,
        )

    except PermissionError as e:
        return error_response(
            message=str(e),
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            request_id=request_id,
        )

    except ValidationError as e:
        return error_response(
            message="Category update failed",
            errors=e.detail,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating category {category_id}: {e}")
        return error_response(
            message="Category update failed",
            errors="An unexpected error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CATEGORY_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_delete_category(request, category_id):
    """
    Delete a category (soft delete).
    Operator only.
    """
    request_id = generate_request_id()

    try:
        success = CategoryService.delete_category(request.user, category_id)

        if not success:
            return error_response(
                message="Category not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="CATEGORY_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Category deleted successfully",
            status_code=status.HTTP_200_OK,
            code="CATEGORY_DELETED",
            request_id=request_id,
        )

    except PermissionError as e:
        return error_response(
            message=str(e),
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error deleting category {category_id}: {e}")
        return error_response(
            message="Category deletion failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CATEGORY_DELETE_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_product(request):
    """
    Create a new product.
    Operator only.
    """
    request_id = generate_request_id()

    serializer = ProductCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Product creation failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        product = ProductService.create_product(request.user, serializer.validated_data)
        return success_response(
            message="Product created successfully",
            data=ProductSerializer(product).data,
            status_code=status.HTTP_201_CREATED,
            code="PRODUCT_CREATED",
            request_id=request_id,
        )

    except PermissionError as e:
        return error_response(
            message=str(e),
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error creating product: {e}")
        return error_response(
            message="Product creation failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PRODUCT_CREATE_ERROR",
            request_id=request_id,
        )


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def admin_update_product(request, product_id):
    """
    Update a product.
    Operator only.
    """
    request_id = generate_request_id()

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return error_response(
            message="Product not found",
            status_code=status.HTTP_404_NOT_FOUND,
            code="PRODUCT_NOT_FOUND",
            request_id=request_id,
        )

    serializer = ProductUpdateSerializer(
        instance=product, data=request.data, partial=(request.method == "PATCH")
    )

    if not serializer.is_valid():
        return error_response(
            message="Product update failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        update_data = {
            k: v for k, v in serializer.validated_data.items() if v is not None
        }
        product = ProductService.update_product(request.user, product, update_data)

        return success_response(
            message="Product updated successfully",
            data=ProductSerializer(product).data,
            status_code=status.HTTP_200_OK,
            code="PRODUCT_UPDATED",
            request_id=request_id,
        )

    except PermissionError as e:
        return error_response(
            message=str(e),
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating product {product_id}: {e}")
        return error_response(
            message="Product update failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PRODUCT_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_delete_product(request, product_id):
    """
    Delete a product (soft delete).
    Operator only.
    """
    request_id = generate_request_id()

    try:
        success = ProductService.delete_product(request.user, product_id)

        if not success:
            return error_response(
                message="Product not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="PRODUCT_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Product deleted successfully",
            status_code=status.HTTP_200_OK,
            code="PRODUCT_DELETED",
            request_id=request_id,
        )

    except PermissionError as e:
        return error_response(
            message=str(e),
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error deleting product {product_id}: {e}")
        return error_response(
            message="Product deletion failed",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PRODUCT_DELETE_ERROR",
            request_id=request_id,
        )
