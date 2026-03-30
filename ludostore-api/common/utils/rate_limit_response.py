from rest_framework import status

from .response import error_response


def rate_limit_response(rl: dict, request_id: str, code: str):
    minutes = rl["retry_after"] // 60
    return error_response(
        message=(
            f"Too many attempts. Please wait {minutes} minute{'s' if minutes != 1 else ''} "
            f"before trying again."
        ),
        errors={
            "retry_after": rl["retry_after"],
            "attempts": rl["attempts"],
            "remaining": rl["remaining"],
        },
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        code=code,
        request_id=request_id,
    )
