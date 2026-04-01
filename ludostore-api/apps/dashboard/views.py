"""
Operator views for admin dashboard and management.
All endpoints require operator role.

Why separate operator app:
- Clean separation between public/customer endpoints and admin endpoints
- All operator endpoints under /api/dashboard/ prefix
- Centralized role checking
- Easy to add new admin features without affecting customer endpoints
"""

import logging
from datetime import datetime
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.accounts.constants import AccountStatus, Role
from apps.accounts.models import User, UserAccount
from apps.orders.models import Order
from apps.products.models import Product, ProductImage
from common.utils.check_operator import check_operator
from common.utils.pagination import get_pagination_params
from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard overview statistics.
    Operator only.

    Returns:
        - total_orders: Total number of orders
        - pending_orders: Orders pending processing
        - processing_orders: Orders being processed
        - completed_orders: Delivered orders
        - cancelled_orders: Cancelled orders
        - total_revenue: Total revenue from paid orders
        - total_products: Active products count
        - low_stock_products: Products with stock <= 5
        - out_of_stock_products: Products with stock = 0
        - total_users: Total registered users
        - active_users: Users with active status
        - blocked_users: Users with blocked status
        - recent_orders: Last 5 orders
        - recent_users: Last 5 registered users
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        # Order stats
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(
            order_status=Order.OrderStatus.PENDING
        ).count()
        processing_orders = Order.objects.filter(
            order_status=Order.OrderStatus.PROCESSING
        ).count()
        completed_orders = Order.objects.filter(
            order_status=Order.OrderStatus.DELIVERED
        ).count()
        cancelled_orders = Order.objects.filter(
            order_status=Order.OrderStatus.CANCELLED
        ).count()

        # Revenue stats, only from paid orders
        paid_orders = Order.objects.filter(payment_status=Order.PaymentStatus.PAID)
        total_revenue = paid_orders.aggregate(total=Sum("total"))["total"] or Decimal(
            "0.00"
        )

        total_products = Product.objects.filter(is_active=True).count()
        low_stock_products = Product.objects.filter(
            stock_quantity__lte=5, stock_quantity__gt=0, is_active=True
        ).count()
        out_of_stock_products = Product.objects.filter(
            stock_quantity=0, is_active=True
        ).count()

        total_users = User.objects.count()
        active_users = UserAccount.objects.filter(
            account_status=AccountStatus.ACTIVE
        ).count()
        blocked_users = UserAccount.objects.filter(
            account_status=AccountStatus.BLOCKED
        ).count()

        # Recent orders (last 5)
        recent_orders = Order.objects.select_related("user").order_by("-created_at")[:5]
        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append(
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "total": str(order.total),
                    "order_status": order.order_status,
                    "payment_status": order.payment_status,
                    "customer_email": order.user.email,
                    "customer_name": f"{order.user.account.first_name} {order.user.account.last_name}".strip(),
                    "created_at": order.created_at.isoformat(),
                }
            )

        # Recent users (last 5)
        recent_users = User.objects.select_related("account").order_by("-date_joined")[
            :5
        ]
        recent_users_data = []
        for user in recent_users:
            recent_users_data.append(
                {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.account.first_name,
                    "last_name": user.account.last_name,
                    "account_status": user.account.account_status,
                    "role": user.account.role,
                    "date_joined": user.date_joined.isoformat(),
                }
            )

        return success_response(
            message="Dashboard stats retrieved",
            data={
                "orders": {
                    "total": total_orders,
                    "pending": pending_orders,
                    "processing": processing_orders,
                    "completed": completed_orders,
                    "cancelled": cancelled_orders,
                },
                "revenue": {
                    "total": str(total_revenue),
                },
                "products": {
                    "total": total_products,
                    "low_stock": low_stock_products,
                    "out_of_stock": out_of_stock_products,
                },
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "blocked": blocked_users,
                },
                "recent_orders": recent_orders_data,
                "recent_users": recent_users_data,
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving dashboard stats: {e}")
        return error_response(
            message="Failed to retrieve dashboard stats",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="DASHBOARD_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def revenue_chart(request):
    """
    Get revenue data for charts.
    Operator only.

    Query params:
    - period: day, week, month, year (default: week)
    - start_date: YYYY-MM-DD (optional)
    - end_date: YYYY-MM-DD (optional)

    Returns:
        - labels: Array of date labels
        - revenue: Array of revenue values
        - orders_count: Array of order counts
        - total: Total revenue for the period
        - period: The period used
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        period = request.GET.get("period", "week")
        start_date_str = request.GET.get("start_date")
        end_date_str = request.GET.get("end_date")

        orders = Order.objects.filter(payment_status=Order.PaymentStatus.PAID)

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                orders = orders.filter(created_at__date__gte=start_date)
            except ValueError:
                return error_response(
                    message="Invalid start_date format. Use YYYY-MM-DD",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    code="INVALID_DATE_FORMAT",
                    request_id=request_id,
                )

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
                orders = orders.filter(created_at__date__lte=end_date)
            except ValueError:
                return error_response(
                    message="Invalid end_date format. Use YYYY-MM-DD",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    code="INVALID_DATE_FORMAT",
                    request_id=request_id,
                )

        # Group by period
        if period == "day":
            orders_by_date = (
                orders.annotate(date=TruncDay("created_at"))
                .values("date")
                .annotate(daily_revenue=Sum("total"), daily_orders=Count("id"))
                .order_by("date")
            )

            labels = [item["date"].strftime("%Y-%m-%d") for item in orders_by_date]
            revenue = [float(item["daily_revenue"]) for item in orders_by_date]
            orders_count = [item["daily_orders"] for item in orders_by_date]

        elif period == "week":
            orders_by_date = (
                orders.annotate(week=TruncWeek("created_at"))
                .values("week")
                .annotate(weekly_revenue=Sum("total"), weekly_orders=Count("id"))
                .order_by("week")
            )

            labels = [item["week"].strftime("%Y-%m-%d") for item in orders_by_date]
            revenue = [float(item["weekly_revenue"]) for item in orders_by_date]
            orders_count = [item["weekly_orders"] for item in orders_by_date]

        elif period == "month":
            orders_by_date = (
                orders.annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(monthly_revenue=Sum("total"), monthly_orders=Count("id"))
                .order_by("month")
            )

            labels = [item["month"].strftime("%Y-%m") for item in orders_by_date]
            revenue = [float(item["monthly_revenue"]) for item in orders_by_date]
            orders_count = [item["monthly_orders"] for item in orders_by_date]

        elif period == "year":
            orders_by_date = (
                orders.annotate(year=TruncYear("created_at"))
                .values("year")
                .annotate(yearly_revenue=Sum("total"), yearly_orders=Count("id"))
                .order_by("year")
            )

            labels = [item["year"].strftime("%Y") for item in orders_by_date]
            revenue = [float(item["yearly_revenue"]) for item in orders_by_date]
            orders_count = [item["yearly_orders"] for item in orders_by_date]

        else:
            return error_response(
                message="Invalid period. Must be day, week, month, or year",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_PERIOD",
                request_id=request_id,
            )

        # Calculate total revenue
        total_revenue = sum(revenue)

        return success_response(
            message="Revenue chart data retrieved",
            data={
                "labels": labels,
                "revenue": revenue,
                "orders_count": orders_count,
                "total": str(total_revenue),
                "period": period,
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving revenue chart: {e}")
        return error_response(
            message="Failed to retrieve revenue chart",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="REVENUE_CHART_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def operator_orders(request):
    """
    List all orders (admin view) with pagination and filters.
    Operator only.

    Query params:
    - page: Page number
    - page_size: Items per page
    - order_status: Filter by order status
    - payment_status: Filter by payment status
    - search: Search by order number or customer email
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        page, page_size = get_pagination_params(request)

        order_status = request.GET.get("order_status")
        payment_status = request.GET.get("payment_status")
        search = request.GET.get("search")

        orders = Order.objects.select_related("user")

        if order_status:
            orders = orders.filter(order_status=order_status)

        if payment_status:
            orders = orders.filter(payment_status=payment_status)

        if search:
            orders = orders.filter(
                Q(order_number__icontains=search) | Q(user__email__icontains=search)
            )

        orders = orders.order_by("-created_at")

        from django.core.paginator import Paginator

        paginator = Paginator(orders, page_size)
        page_obj = paginator.get_page(page)

        orders_data = []
        for order in page_obj.object_list:
            orders_data.append(
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "customer_email": order.user.email,
                    "customer_name": f"{order.user.account.first_name} {order.user.account.last_name}".strip(),
                    "total": str(order.total),
                    "order_status": order.order_status,
                    "payment_method": order.payment_method,
                    "payment_status": order.payment_status,
                    "created_at": order.created_at.isoformat(),
                    "items_count": order.items.count(),
                }
            )

        return success_response(
            message="Orders retrieved",
            data={
                "orders": orders_data,
                "pagination": {
                    "total": paginator.count,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": paginator.num_pages,
                    "has_next": page_obj.has_next(),
                    "has_prev": page_obj.has_previous(),
                },
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving orders: {e}")
        return error_response(
            message="Failed to retrieve orders",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ORDERS_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def operator_order_detail(request, order_id):
    """
    Get detailed order information.
    Operator only.
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        try:
            order = Order.objects.select_related("user").get(id=order_id)
        except Order.DoesNotExist:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        items = []
        for item in order.items.all():
            items.append(
                {
                    "id": str(item.id),
                    "product_id": str(item.product.id),
                    "product_name": item.product_name,
                    "product_sku": item.product_sku,
                    "quantity": item.quantity,
                    "price_at_purchase": str(item.price_at_purchase),
                    "subtotal": str(item.subtotal),
                }
            )

        order_data = {
            "id": str(order.id),
            "order_number": order.order_number,
            "customer": {
                "id": str(order.user.id),
                "email": order.user.email,
                "first_name": order.user.account.first_name,
                "last_name": order.user.account.last_name,
                "phone_number": order.user.account.phone_number,
            },
            "shipping_address": order.shipping_address,
            "subtotal": str(order.subtotal),
            "shipping_fee": str(order.shipping_fee),
            "tax": str(order.tax),
            "discount": str(order.discount),
            "total": str(order.total),
            "order_status": order.order_status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "paystack_reference": order.paystack_reference,
            "customer_note": order.customer_note,
            "admin_note": order.admin_note,
            "items": items,
            "created_at": order.created_at.isoformat(),
            "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        }

        return success_response(
            message="Order details retrieved",
            data=order_data,
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving order details: {e}")
        return error_response(
            message="Failed to retrieve order details",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ORDER_ERROR",
            request_id=request_id,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """
    Update order status.
    Operator only.

    Request body:
    {
        "order_status": "processing" | "shipped" | "delivered" | "cancelled"
    }
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        new_status = request.data.get("order_status")
        admin_note = request.data.get("admin_note", "")

        if not new_status:
            return error_response(
                message="order_status is required",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="MISSING_FIELD",
                request_id=request_id,
            )

        valid_statuses = [s[0] for s in Order.OrderStatus.choices]
        if new_status not in valid_statuses:
            return error_response(
                message=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS",
                request_id=request_id,
            )

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return error_response(
                message="Order not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="ORDER_NOT_FOUND",
                request_id=request_id,
            )

        old_status = order.order_status
        order.order_status = new_status
        if admin_note:
            order.admin_note = admin_note
        order.save(update_fields=["order_status", "admin_note", "updated_at"])

        logger.info(
            f"Order {order.order_number} status updated by {request.user.email}: {old_status} -> {new_status}"
        )

        return success_response(
            message=f"Order status updated to {new_status}",
            data={
                "order_id": str(order.id),
                "order_number": order.order_number,
                "old_status": old_status,
                "new_status": new_status,
            },
            status_code=status.HTTP_200_OK,
            code="ORDER_STATUS_UPDATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating order status: {e}")
        return error_response(
            message="Failed to update order status",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ORDER_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def operator_products(request):
    """
    List all products (admin view) with pagination and filters.
    Operator only.

    Query params:
    - page: Page number
    - page_size: Items per page
    - category_id: Filter by category
    - is_active: Filter by active status
    - low_stock: Filter products with low stock (<=5)
    - search: Search by name or SKU
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        page, page_size = get_pagination_params(request)

        category_id = request.GET.get("category_id")
        is_active = request.GET.get("is_active")
        low_stock = request.GET.get("low_stock")
        search = request.GET.get("search")

        products = Product.objects.select_related("category")

        if category_id:
            products = products.filter(category_id=category_id)

        if is_active is not None:
            products = products.filter(is_active=is_active.lower() == "true")

        if low_stock:
            products = products.filter(stock_quantity__lte=5)

        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(sku__icontains=search)
            )

        products = products.order_by("-created_at")

        from django.core.paginator import Paginator

        paginator = Paginator(products, page_size)
        page_obj = paginator.get_page(page)

        products_data = []
        for product in page_obj.object_list:
            primary_image = product.images.filter(is_primary=True).first()
            products_data.append(
                {
                    "id": str(product.id),
                    "name": product.name,
                    "slug": product.slug,
                    "sku": product.sku,
                    "regular_price": str(product.regular_price),
                    "sale_price": str(product.sale_price)
                    if product.sale_price
                    else None,
                    "current_price": str(product.current_price),
                    "stock_quantity": product.stock_quantity,
                    "stock_status": product.stock_status,
                    "category_name": product.category.name
                    if product.category
                    else None,
                    "is_active": product.is_active,
                    "featured": product.featured,
                    "primary_image": primary_image.image.url if primary_image else None,
                    "created_at": product.created_at.isoformat(),
                }
            )

        return success_response(
            message="Products retrieved",
            data={
                "products": products_data,
                "pagination": {
                    "total": paginator.count,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": paginator.num_pages,
                    "has_next": page_obj.has_next(),
                    "has_prev": page_obj.has_previous(),
                },
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving products: {e}")
        return error_response(
            message="Failed to retrieve products",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PRODUCTS_ERROR",
            request_id=request_id,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_product_stock(request, product_id):
    """
    Update product stock quantity.
    Operator only.

    Request body:
    {
        "stock_quantity": 50
    }
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        new_quantity = request.data.get("stock_quantity")

        if new_quantity is None:
            return error_response(
                message="stock_quantity is required",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="MISSING_FIELD",
                request_id=request_id,
            )

        try:
            new_quantity = int(new_quantity)
            if new_quantity < 0:
                raise ValueError
        except ValueError:
            return error_response(
                message="stock_quantity must be a non-negative integer",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_QUANTITY",
                request_id=request_id,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return error_response(
                message="Product not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="PRODUCT_NOT_FOUND",
                request_id=request_id,
            )

        old_quantity = product.stock_quantity
        product.stock_quantity = new_quantity

        if new_quantity > 0:
            product.stock_status = Product.StockStatus.IN_STOCK
        else:
            product.stock_status = Product.StockStatus.OUT_OF_STOCK

        product.save(update_fields=["stock_quantity", "stock_status", "updated_at"])

        logger.info(
            f"Product {product.sku} stock updated by {request.user.email}: {old_quantity} -> {new_quantity}"
        )

        return success_response(
            message="Stock updated successfully",
            data={
                "product_id": str(product.id),
                "product_name": product.name,
                "old_quantity": old_quantity,
                "new_quantity": new_quantity,
                "stock_status": product.stock_status,
            },
            status_code=status.HTTP_200_OK,
            code="STOCK_UPDATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating product stock: {e}")
        return error_response(
            message="Failed to update stock",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="STOCK_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_product_image(request, product_id):
    """
    Add image to product.
    Operator only.

    Request: multipart/form-data with 'image' file
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return error_response(
                message="Product not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="PRODUCT_NOT_FOUND",
                request_id=request_id,
            )

        image_file = request.FILES.get("image")
        if not image_file:
            return error_response(
                message="Image file is required",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="MISSING_IMAGE",
                request_id=request_id,
            )

        is_primary = request.data.get("is_primary", "").lower() == "true"
        order = int(request.data.get("order", 0))

        # If this is the first image, make it primary
        if product.images.count() == 0:
            is_primary = True

        # If setting as primary, remove primary from other images
        if is_primary:
            product.images.filter(is_primary=True).update(is_primary=False)

        image = ProductImage.objects.create(
            product=product, image=image_file, is_primary=is_primary, order=order
        )

        logger.info(f"Image added to product {product.sku} by {request.user.email}")

        return success_response(
            message="Image added successfully",
            data={
                "id": str(image.id),
                "product_id": str(product.id),
                "image_url": image.image.url,
                "is_primary": image.is_primary,
                "order": image.order,
            },
            status_code=status.HTTP_201_CREATED,
            code="IMAGE_ADDED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error adding product image: {e}")
        return error_response(
            message="Failed to add image",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="IMAGE_ADD_ERROR",
            request_id=request_id,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def operator_users(request):
    """
    List all users (admin view) with pagination and filters.
    Operator only.

    Query params:
    - page: Page number
    - page_size: Items per page
    - role: Filter by role (customer/operator)
    - account_status: Filter by account status
    - search: Search by email or name
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        page, page_size = get_pagination_params(request)

        role = request.GET.get("role")
        account_status = request.GET.get("account_status")
        search = request.GET.get("search")

        users = User.objects.select_related("account").all()

        if role:
            users = users.filter(account__role=role)

        if account_status:
            users = users.filter(account__account_status=account_status)

        if search:
            users = users.filter(
                Q(email__icontains=search)
                | Q(account__first_name__icontains=search)
                | Q(account__last_name__icontains=search)
            )

        users = users.order_by("-date_joined")

        from django.core.paginator import Paginator

        paginator = Paginator(users, page_size)
        page_obj = paginator.get_page(page)

        users_data = []
        for user in page_obj.object_list:
            users_data.append(
                {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.account.first_name,
                    "last_name": user.account.last_name,
                    "phone_number": user.account.phone_number,
                    "role": user.account.role,
                    "account_status": user.account.account_status,
                    "is_email_verified": user.account.is_email_verified,
                    "date_joined": user.date_joined.isoformat(),
                    "last_login": user.last_login.isoformat()
                    if user.last_login
                    else None,
                    "orders_count": user.orders.count(),
                    "total_spent": str(
                        user.orders.filter(
                            payment_status=Order.PaymentStatus.PAID
                        ).aggregate(total=Sum("total"))["total"]
                        or Decimal("0.00")
                    ),
                }
            )

        return success_response(
            message="Users retrieved",
            data={
                "users": users_data,
                "pagination": {
                    "total": paginator.count,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": paginator.num_pages,
                    "has_next": page_obj.has_next(),
                    "has_prev": page_obj.has_previous(),
                },
            },
            status_code=status.HTTP_200_OK,
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error retrieving users: {e}")
        return error_response(
            message="Failed to retrieve users",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="USERS_ERROR",
            request_id=request_id,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_status(request, user_id):
    """
    Block or unblock a user.
    Operator only.

    Request body:
    {
        "account_status": "blocked" | "active",
        "block_reason": "optional reason"
    }
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        # Prevent operator from blocking themselves
        if str(user_id) == str(request.user.id):
            return error_response(
                message="You cannot block your own account",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="CANNOT_BLOCK_SELF",
                request_id=request_id,
            )

        new_status = request.data.get("account_status")
        block_reason = request.data.get("block_reason", "")

        if not new_status:
            return error_response(
                message="account_status is required",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="MISSING_FIELD",
                request_id=request_id,
            )

        valid_statuses = [s[0] for s in AccountStatus.CHOICES]
        if new_status not in valid_statuses:
            return error_response(
                message=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_STATUS",
                request_id=request_id,
            )

        try:
            user = User.objects.get(id=user_id)
            account = user.account
        except User.DoesNotExist:
            return error_response(
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="USER_NOT_FOUND",
                request_id=request_id,
            )

        old_status = account.account_status
        account.account_status = new_status
        account.block_reason = (
            block_reason if new_status == AccountStatus.BLOCKED else ""
        )

        if new_status == AccountStatus.BLOCKED:
            account.blocked_at = timezone.now()
            account.blocked_by = request.user
        else:
            account.blocked_at = None
            account.blocked_by = None

        account.save()

        logger.info(
            f"User {user.email} status updated by {request.user.email}: {old_status} -> {new_status}"
        )

        return success_response(
            message=f"User status updated to {new_status}",
            data={
                "user_id": str(user.id),
                "email": user.email,
                "old_status": old_status,
                "new_status": new_status,
            },
            status_code=status.HTTP_200_OK,
            code="USER_STATUS_UPDATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating user status: {e}")
        return error_response(
            message="Failed to update user status",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="USER_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_role(request, user_id):
    """
    Update user role (customer/operator).
    Operator only.

    Request body:
    {
        "role": "customer" | "operator"
    }
    """
    request_id = generate_request_id()

    try:
        # Check operator permission
        if not check_operator(request.user):
            return error_response(
                message="Access denied. Operator privileges required.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="ACCESS_DENIED",
                request_id=request_id,
            )

        # Prevent operator from demoting themselves
        if str(user_id) == str(request.user.id):
            return error_response(
                message="You cannot change your own role",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="CANNOT_CHANGE_OWN_ROLE",
                request_id=request_id,
            )

        new_role = request.data.get("role")

        if not new_role:
            return error_response(
                message="role is required",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="MISSING_FIELD",
                request_id=request_id,
            )

        valid_roles = [r[0] for r in Role.CHOICES]
        if new_role not in valid_roles:
            return error_response(
                message=f"Invalid role. Must be one of: {', '.join(valid_roles)}",
                status_code=status.HTTP_400_BAD_REQUEST,
                code="INVALID_ROLE",
                request_id=request_id,
            )

        try:
            user = User.objects.get(id=user_id)
            account = user.account
        except User.DoesNotExist:
            return error_response(
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND,
                code="USER_NOT_FOUND",
                request_id=request_id,
            )

        old_role = account.role
        account.role = new_role
        account.save(update_fields=["role", "updated_at"])

        # If setting as operator, also set is_staff for admin panel access
        if new_role == Role.OPERATOR:
            user.is_staff = True
            user.save(update_fields=["is_staff"])
        else:
            user.is_staff = False
            user.save(update_fields=["is_staff"])

        logger.info(
            f"User {user.email} role updated by {request.user.email}: {old_role} -> {new_role}"
        )

        return success_response(
            message=f"User role updated to {new_role}",
            data={
                "user_id": str(user.id),
                "email": user.email,
                "old_role": old_role,
                "new_role": new_role,
            },
            status_code=status.HTTP_200_OK,
            code="USER_ROLE_UPDATED",
            request_id=request_id,
        )

    except Exception as e:
        logger.exception(f"Error updating user role: {e}")
        return error_response(
            message="Failed to update user role",
            errors="An error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="ROLE_UPDATE_ERROR",
            request_id=request_id,
        )
