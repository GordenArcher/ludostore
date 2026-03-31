import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

from .serializers import AddToCartSerializer, CartSerializer, UpdateCartItemSerializer
from .services import CartService

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """
    Get user's cart with all items.
    """
    request_id = generate_request_id()

    try:
        cart = CartService.get_cart(request.user)
        serializer = CartSerializer(cart)
        return success_response(
            message="Cart retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )
    except Exception as e:
        logger.exception(f"Error retrieving cart: {e}")
        return error_response(
            message="Failed to retrieve cart",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """
    Add a product to cart.
    If product already exists, quantity increases.
    """
    request_id = generate_request_id()

    serializer = AddToCartSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Failed to add to cart",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        item = CartService.add_item(
            user=request.user,
            product_id=serializer.validated_data["product_id"],
            quantity=serializer.validated_data.get("quantity", 1),
        )

        if not item:
            return error_response(
                message="Product not found or out of stock",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="OUT_OF_STOCK",
                request_id=request_id,
            )

        return success_response(
            message="Item added to cart",
            data={"item_id": item.id},
            status_code=status.HTTP_200_OK,
            code="CART_ITEM_ADDED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error adding to cart: {e}")
        return error_response(
            message="Failed to add to cart",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_ADD_ERROR",
            request_id=request_id,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """
    Update quantity of a cart item.
    """
    request_id = generate_request_id()

    serializer = UpdateCartItemSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Failed to update cart item",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        item = CartService.update_item_quantity(
            user=request.user,
            item_id=item_id,
            quantity=serializer.validated_data["quantity"],
        )

        if not item:
            return error_response(
                message="Cart item not found or insufficient stock",
                status_code=status.HTTP_404_NOT_FOUND,
                code="CART_ITEM_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Cart item updated",
            status_code=status.HTTP_200_OK,
            code="CART_ITEM_UPDATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating cart item: {e}")
        return error_response(
            message="Failed to update cart item",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, item_id):
    """
    Remove a specific item from cart by item ID.
    """
    request_id = generate_request_id()

    try:
        success = CartService.remove_item(request.user, item_id)

        if not success:
            return error_response(
                message="Cart item not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="CART_ITEM_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Item removed from cart",
            status_code=status.HTTP_200_OK,
            code="CART_ITEM_REMOVED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error removing cart item: {e}")
        return error_response(
            message="Failed to remove item",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_REMOVE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_product_from_cart(request, product_id):
    """
    Remove a product from cart by product ID.
    """
    request_id = generate_request_id()

    try:
        success = CartService.remove_product(request.user, product_id)

        if not success:
            return error_response(
                message="Product not found in cart",
                status_code=status.HTTP_404_NOT_FOUND,
                code="PRODUCT_NOT_IN_CART",
                request_id=request_id,
            )

        return success_response(
            message="Product removed from cart",
            status_code=status.HTTP_200_OK,
            code="PRODUCT_REMOVED_FROM_CART",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error removing product from cart: {e}")
        return error_response(
            message="Failed to remove product",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_REMOVE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """
    Remove all items from user's cart.
    """
    request_id = generate_request_id()

    try:
        count = CartService.clear_cart(request.user)
        return success_response(
            message="Cart cleared successfully",
            data={"items_removed": count},
            status_code=status.HTTP_200_OK,
            code="CART_CLEARED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error clearing cart: {e}")
        return error_response(
            message="Failed to clear cart",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_CLEAR_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart_count(request):
    """
    Get total number of items in cart.
    Useful for showing badge in navigation.
    """
    request_id = generate_request_id()

    try:
        count = CartService.get_cart_item_count(request.user)
        return success_response(
            message="Cart count retrieved",
            data={"count": count},
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error getting cart count: {e}")
        return error_response(
            message="Failed to get cart count",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="CART_COUNT_ERROR",
            request_id=request_id,
        )
