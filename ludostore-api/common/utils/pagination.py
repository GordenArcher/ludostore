def get_pagination_params(request):
    """
    Extract pagination parameters from request.

    Returns:
        tuple: (page, page_size)
    """
    try:
        page = int(request.GET.get("page", 1))
    except (TypeError, ValueError):
        page = 1

    try:
        page_size = int(request.GET.get("page_size", 20))
    except (TypeError, ValueError):
        page_size = 20

    # Limit page size to reasonable maximum
    page_size = min(page_size, 100)

    return page, page_size
