import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

from .serializers import (
    AddToWishlistSerializer,
    WishlistItemSerializer,
    WishlistSerializer,
)
from .services import WishlistService

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    """
    Get user's wishlist with all items.
    """
    request_id = generate_request_id()

    try:
        wishlist = WishlistService.get_wishlist(request.user)
        serializer = WishlistSerializer(wishlist)
        return success_response(
            message="Wishlist retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )
    except Exception as e:
        logger.exception(f"Error retrieving wishlist: {e}")
        return error_response(
            message="Failed to retrieve wishlist",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    """
    Add a product to wishlist.
    """
    request_id = generate_request_id()

    serializer = AddToWishlistSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Failed to add item to wishlist",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        item = WishlistService.add_item(
            user=request.user,
            product_id=serializer.validated_data["product_id"],
            notes=serializer.validated_data.get("notes", ""),
        )

        if not item:
            return error_response(
                message="Product already in wishlist or not found",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="ALREADY_IN_WISHLIST",
                request_id=request_id,
            )

        return success_response(
            message="Item added to wishlist",
            data=WishlistItemSerializer(item).data,
            status_code=status.HTTP_201_CREATED,
            code="WISHLIST_ITEM_ADDED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error adding item to wishlist: {e}")
        return error_response(
            message="Failed to add item to wishlist",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_ADD_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_wishlist_item(request, item_id):
    """
    Remove a specific item from wishlist by item ID.
    """
    request_id = generate_request_id()

    try:
        success = WishlistService.remove_item(request.user, item_id)

        if not success:
            return error_response(
                message="Wishlist item not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="WISHLIST_ITEM_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Item removed from wishlist",
            status_code=status.HTTP_200_OK,
            code="WISHLIST_ITEM_REMOVED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error removing wishlist item: {e}")
        return error_response(
            message="Failed to remove item",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_REMOVE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_product_from_wishlist(request, product_id):
    """
    Remove a product from wishlist by product ID.
    """
    request_id = generate_request_id()

    try:
        success = WishlistService.remove_product(request.user, product_id)

        if not success:
            return error_response(
                message="Product not found in wishlist",
                status_code=status.HTTP_404_NOT_FOUND,
                code="PRODUCT_NOT_IN_WISHLIST",
                request_id=request_id,
            )

        return success_response(
            message="Product removed from wishlist",
            status_code=status.HTTP_200_OK,
            code="PRODUCT_REMOVED_FROM_WISHLIST",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error removing product from wishlist: {e}")
        return error_response(
            message="Failed to remove product",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_REMOVE_ERROR",
            request_id=request_id,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_wishlist_item_notes(request, item_id):
    """
    Update notes for a wishlist item.
    """
    request_id = generate_request_id()

    notes = request.data.get("notes", "")

    try:
        item = WishlistService.update_item_notes(
            user=request.user, item_id=item_id, notes=notes
        )

        if not item:
            return error_response(
                message="Wishlist item not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="WISHLIST_ITEM_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Wishlist item updated",
            data=WishlistItemSerializer(item).data,
            status_code=status.HTTP_200_OK,
            code="WISHLIST_ITEM_UPDATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating wishlist item: {e}")
        return error_response(
            message="Failed to update wishlist item",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_wishlist(request):
    """
    Remove all items from user's wishlist.
    """
    request_id = generate_request_id()

    try:
        count = WishlistService.clear_wishlist(request.user)
        return success_response(
            message="Wishlist cleared successfully",
            data={"items_removed": count},
            status_code=status.HTTP_200_OK,
            code="WISHLIST_CLEARED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error clearing wishlist: {e}")
        return error_response(
            message="Failed to clear wishlist",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_CLEAR_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_in_wishlist(request, product_id):
    """
    Check if a product is in user's wishlist.
    """
    request_id = generate_request_id()

    try:
        is_in = WishlistService.is_in_wishlist(request.user, product_id)
        return success_response(
            message="Wishlist check completed",
            data={"is_in_wishlist": is_in},
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error checking wishlist: {e}")
        return error_response(
            message="Failed to check wishlist",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WISHLIST_CHECK_ERROR",
            request_id=request_id,
        )
