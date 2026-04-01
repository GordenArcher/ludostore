from apps.accounts.constants import Role


def check_operator(user):
    """
    Check if user has operator role.

    Args:
        user: Django user object

    Returns:
        bool: True if user is operator, False otherwise
    """
    try:
        return user.is_authenticated and user.account.role == Role.OPERATOR
    except Exception:
        return False
