"""
File validation utilities for secure file uploads.
"""

import os
from typing import Tuple, List
from PIL import Image


def validate_image_file(file, max_size_mb: int = 5) -> Tuple[bool, str]:
    """
    Validate uploaded image file for security.

    Checks:
    - File size (max 5MB default)
    - File extension
    - Image integrity using PIL

    Args:
        file: Uploaded file object
        max_size_mb: Maximum file size in MB (default 5)

    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """

    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}

    # Check 1: File exists
    if not file:
        return False, "No file provided"

    # Check 2: File size
    max_size_bytes = max_size_mb * 1024 * 1024
    if file.size > max_size_bytes:
        return False, f"File too large. Maximum size is {max_size_mb}MB"

    # Check 3: File extension
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"

    # Check 4: Image integrity using PIL
    try:
        img = Image.open(file)
        img.verify()  # Verify image integrity
        file.seek(0)  # Reset file pointer after verification
    except Exception as e:
        return False, f"Invalid or corrupted image file: {str(e)}"

    return True, ""


def validate_multiple_images(files: List, max_files: int = 4, max_size_mb: int = 5) -> Tuple[bool, List, str]:
    """
    Validate multiple image files.

    Args:
        files: List of uploaded files
        max_files: Maximum number of files allowed
        max_size_mb: Maximum size per file in MB

    Returns:
        Tuple[bool, list, str]: (is_valid, valid_files, error_message)
    """

    # Check number of files
    if len(files) > max_files:
        return False, [], f"Too many files. Maximum {max_files} images allowed"

    valid_files = []
    errors = []

    for i, file in enumerate(files):
        is_valid, error = validate_image_file(file, max_size_mb)
        if is_valid:
            valid_files.append(file)
        else:
            errors.append(f"File {i+1}: {error}")

    if errors:
        return False, valid_files, "; ".join(errors)

    return True, valid_files, ""
