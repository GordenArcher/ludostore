"""
Address views.

Function-based views with manual validation.
"""

import logging

from common.utils.pagination import get_pagination_params
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

from .models import Address
from .serializers import (
    AddressCreateSerializer,
    AddressSerializer,
    AddressUpdateSerializer,
)
from .services import AddressService

logger = logging.getLogger(__name__)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def address_list(request):
    """
    List or create addresses.

    GET: List user addresses (paginated)
    POST: Create new address
    """
    request_id = generate_request_id()

    if request.method == "GET":
        # Get pagination parameters
        page, page_size = get_pagination_params(request)

        # Get paginated addresses
        result = AddressService.get_user_addresses(
            user=request.user, page=page, page_size=page_size
        )

        # Serialize addresses
        serializer = AddressSerializer(result["items"], many=True)

        return success_response(
            message="Addresses retrieved",
            data={
                "addresses": serializer.data,
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

    # POST - Create new address
    serializer = AddressCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return error_response(
            message="Address creation failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        address = AddressService.create_address(
            user=request.user, data=serializer.validated_data
        )

        return success_response(
            message="Address created successfully",
            data=AddressSerializer(address).data,
            status_code=status.HTTP_201_CREATED,
            code="ADDRESS_CREATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error creating address: {e}")
        return error_response(
            message="Address creation failed",
            errors="An error occurred while creating the address.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ADDRESS_CREATE_ERROR",
            request_id=request_id,
        )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def address_detail(request, address_id):
    """
    Get, update, or delete an address.
    """
    request_id = generate_request_id()

    # Get the address
    try:
        address = Address.objects.get(
            id=address_id, user=request.user, is_deleted=False
        )
    except Address.DoesNotExist:
        return error_response(
            message="Address not found",
            status_code=status.HTTP_404_NOT_FOUND,
            code="ADDRESS_NOT_FOUND",
            request_id=request_id,
        )

    if request.method == "GET":
        serializer = AddressSerializer(address)
        return success_response(
            message="Address retrieved",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    if request.method in ["PUT", "PATCH"]:
        serializer = AddressUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            return error_response(
                message="Address update failed",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
                code="VALIDATION_ERROR",
                request_id=request_id,
            )

        try:
            # Filter out None values for PATCH
            update_data = {
                k: v for k, v in serializer.validated_data.items() if v is not None
            }
            address = AddressService.update_address(address, update_data)

            return success_response(
                message="Address updated successfully",
                data=AddressSerializer(address).data,
                status_code=status.HTTP_200_OK,
                code="ADDRESS_UPDATED",
                request_id=request_id,
            )

        except Exception as e:
            logger.exception(f"Error updating address: {e}")
            return error_response(
                message="Address update failed",
                errors="An error occurred while updating the address.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                code="ADDRESS_UPDATE_ERROR",
                request_id=request_id,
            )

    if request.method == "DELETE":
        try:
            AddressService.delete_address(address)
            return success_response(
                message="Address deleted successfully",
                status_code=status.HTTP_200_OK,
                code="ADDRESS_DELETED",
                request_id=request_id,
            )
        except Exception as e:
            logger.exception(f"Error deleting address: {e}")
            return error_response(
                message="Address deletion failed",
                errors="An error occurred while deleting the address.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                code="ADDRESS_DELETE_ERROR",
                request_id=request_id,
            )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    """
    Set an address as default.
    """
    request_id = generate_request_id()
    address_type = request.data.get("address_type")

    # Validate address_type if provided
    if address_type and address_type not in Address.AddressType.values:
        return error_response(
            message="Invalid address type",
            errors={
                "address_type": [
                    f"Must be one of: {', '.join(Address.AddressType.values)}"
                ]
            },
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_ADDRESS_TYPE",
            request_id=request_id,
        )

    try:
        address = AddressService.set_default_address(
            user=request.user, address_id=address_id, address_type=address_type
        )

        if not address:
            return error_response(
                message="Address not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ADDRESS_NOT_FOUND",
                request_id=request_id,
            )

        return success_response(
            message="Default address set successfully",
            data=AddressSerializer(address).data,
            status_code=status.HTTP_200_OK,
            code="DEFAULT_ADDRESS_SET",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error setting default address: {e}")
        return error_response(
            message="Failed to set default address",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="DEFAULT_ADDRESS_ERROR",
            request_id=request_id,
        )
