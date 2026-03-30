import logging

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """
    Redis-backed rate limiting middleware.

    Limits requests per IP address and per authenticated user separately.
    Configured via settings.py RATE_LIMIT config dict.

    Exempt paths (e.g. health checks, admin) can be whitelisted.

    Required:
        pip install django-redis   (or redis-py directly)
        CACHES configured with Redis backend in settings.py

    Settings example:
        RATE_LIMIT = {
            "ENABLED":          True,
            "REQUESTS":         100,        # max requests per window
            "WINDOW_SECONDS":   60,         # rolling window in seconds
            "BLOCK_SECONDS":    300,        # how long to block after exceeding limit
            "EXEMPT_PATHS":     ["/health/", "/admin/"],
            "AUTH_REQUESTS":    200,        # higher limit for authenticated users
        }
    """

    def __init__(self, get_response):
        self.get_response = get_response
        config = getattr(settings, "RATE_LIMIT", {})
        self.enabled = config.get("ENABLED", True)
        self.requests = config.get("REQUESTS", 100)
        self.window = config.get("WINDOW_SECONDS", 60)
        self.block_seconds = config.get("BLOCK_SECONDS", 300)
        self.exempt_paths = config.get("EXEMPT_PATHS", ["/health/", "/admin/"])
        self.auth_requests = config.get("AUTH_REQUESTS", 200)

    def __call__(self, request):
        if not self.enabled:
            return self.get_response(request)

        # Skip exempt paths
        for path in self.exempt_paths:
            if request.path.startswith(path):
                return self.get_response(request)

        client_key, limit = self._resolve_key_and_limit(request)
        blocked, remaining, retry_after = self._check_rate(client_key, limit)

        if blocked:
            return self._rate_limit_response(retry_after)

        response = self.get_response(request)

        # Expose rate limit headers on every response
        response["X-RateLimit-Limit"] = str(limit)
        response["X-RateLimit-Remaining"] = str(remaining)
        response["X-RateLimit-Window"] = str(self.window)

        return response

    def _check_rate(self, key: str, limit: int) -> tuple[bool, int, int]:
        """
        Increment the request counter for this key.

        Returns:
            (blocked, remaining, retry_after_seconds)
        """
        try:
            from django.core.cache import cache

            block_key = f"rl:blocked:{key}"
            counter_key = f"rl:count:{key}"

            # Already blocked
            if cache.get(block_key):
                ttl = (
                    cache.ttl(block_key)
                    if hasattr(cache, "ttl")
                    else self.block_seconds
                )
                return True, 0, ttl or self.block_seconds

            count = cache.get(counter_key, 0)
            count += 1
            cache.set(counter_key, count, timeout=self.window)

            if count > limit:
                cache.set(block_key, True, timeout=self.block_seconds)
                cache.delete(counter_key)
                logger.warning(
                    f"[RateLimitMiddleware] Key '{key}' blocked for {self.block_seconds}s."
                )
                return True, 0, self.block_seconds

            remaining = max(limit - count, 0)
            return False, remaining, 0

        except Exception as e:
            # If Redis is down, fail open don't block legitimate traffic
            logger.error(f"[RateLimitMiddleware] Cache error: {str(e)}", exc_info=True)
            return False, limit, 0

    def _resolve_key_and_limit(self, request) -> tuple[str, int]:
        """
        Build the rate limit key and decide the limit.

        Authenticated users get a higher limit and are keyed by user ID.
        Anonymous users are keyed by IP.
        """
        if hasattr(request, "user") and request.user.is_authenticated:
            return f"user:{request.user.id}", self.auth_requests
        return f"ip:{self._get_ip(request)}", self.requests

    @staticmethod
    def _get_ip(request) -> str:
        """Extract real client IP respecting proxies."""
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "unknown")

    @staticmethod
    def _rate_limit_response(retry_after: int) -> JsonResponse:
        return JsonResponse(
            {
                "status": "error",
                "message": "Too many requests. Please slow down.",
                "code": "RATE_LIMIT_EXCEEDED",
                "retry_after_seconds": retry_after,
            },
            status=429,
            headers={"Retry-After": str(retry_after)},
        )
