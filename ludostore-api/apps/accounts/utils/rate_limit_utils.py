"""
Rate limiting utility functions.

Handles rate limiting for:
- OTP requests
- OTP verification
- Login attempts (future)
"""

from typing import Dict, Optional, Tuple

from django.core.cache import cache
from django.utils import timezone


def check_rate_limit(
    key_prefix: str, identifier: str, max_attempts: int, window_seconds: int
) -> Tuple[bool, Optional[Dict]]:
    """
    Check if an operation has exceeded rate limits.

    Rate limiting is crucial for security:
    - Prevents brute force attacks on OTP verification
    - Prevents abuse of OTP request endpoints
    - Limits damage from automated attacks

    Uses Django's cache backend (configured to use Redis in production).
    Falls back to in-memory cache for development.

    Args:
        key_prefix: Prefix for cache key (e.g., 'otp_request', 'otp_verify')
        identifier: Unique identifier (usually email address)
        max_attempts: Maximum attempts allowed in the window
        window_seconds: Time window in seconds

    Returns:
        Tuple[bool, Optional[Dict]]:
            - bool: True if rate limited, False if allowed
            - Dict: Rate limit data if limited, None otherwise
    """
    # Create cache key combining prefix and identifier
    cache_key = f"rate_limit:{key_prefix}:{identifier}"
    current_time = timezone.now().timestamp()

    # Get existing attempts from cache
    attempts = cache.get(cache_key, [])

    # Clean up expired attempts (older than the window)
    window_start = current_time - window_seconds
    attempts = [t for t in attempts if t > window_start]

    # Check if we've exceeded the limit
    if len(attempts) >= max_attempts:
        # Calculate retry after time
        oldest_attempt = min(attempts) if attempts else 0
        retry_after = int(window_seconds - (current_time - oldest_attempt))
        retry_after = max(0, retry_after)

        return True, {
            "retry_after": retry_after,
            "attempts": len(attempts),
            "remaining": 0,
        }

    # Add current attempt and save to cache
    attempts.append(current_time)
    cache.set(cache_key, attempts, timeout=window_seconds)

    return False, {
        "attempts": len(attempts),
        "remaining": max_attempts - len(attempts),
        "retry_after": 0,
    }
