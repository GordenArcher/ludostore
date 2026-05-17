"""
Order utilities for image handling.
"""

import os
import uuid
from typing import List

from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.core.files.storage import default_storage


def save_customization_images(item_id: str, files: List[UploadedFile]) -> List[str]:
    """
    Save customization images for an order item.

    Args:
        item_id: OrderItem ID (string)
        files: List of uploaded image files

    Returns:
        List[str]: List of saved image URLs
    """
    saved_urls = []

    for file in files:
        # Generate unique filename
        ext = os.path.splitext(file.name)[1].lower()
        filename = f"{uuid.uuid4().hex}{ext}"

        # Create path: orders/custom/{order_item_id}/{filename}
        file_path = f"orders/custom/{item_id}/{filename}"

        # Save file
        saved_path = default_storage.save(file_path, file)
        url = default_storage.url(saved_path)
        saved_urls.append(url)

    return saved_urls


def delete_customization_images(item_id: str, image_urls: List[str]) -> bool:
    """
    Delete customization images from storage.

    Args:
        item_id: OrderItem ID
        image_urls: List of image URLs to delete

    Returns:
        bool: True if all deleted successfully
    """
    success = True

    for url in image_urls:
        try:
            # Extract relative path from URL
            if settings.MEDIA_URL in url:
                relative_path = url.split(settings.MEDIA_URL)[-1]
                if default_storage.exists(relative_path):
                    default_storage.delete(relative_path)
        except Exception as e:
            print(f"Error deleting image {url}: {e}")
            success = False

    return success


def get_image_filename_from_url(url: str) -> str:
    """Extract filename from URL."""
    return url.split('/')[-1].split('?')[0]
