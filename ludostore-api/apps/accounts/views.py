"""
Account views.

Thin views that only handle HTTP concerns:
- Manual request validation
- Calling services
- Formatting responses
- Try/catch error handling

"""

import logging

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.models import User
from apps.accounts.utils.security_utils import validate_and_hash_password
from common.utils.ip import get_client_ip
from common.utils.request_id import generate_request_id
from common.utils.response import error_response, success_response

from .serializers import UserAccountSerializer
from .services.account_service import AccountService
from .services.auth_service import AuthService
from .services.otp_service import OTPService

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    User registration endpoint.

    Creates a new user account with email and password.
    Returns success with email for verification.

    Automatic behaviors via signals:
    - Creates UserAccount (post_save on User)
    - Creates verification OTP (post_save on UserAccount)
    - Sends verification email with URL (post_save on UserAccount)
    - Sends welcome email (post_save on UserAccount)

    Manual validation:
    - Email and password are required
    - Password and confirm_password must match
    - Password must be at least 8 characters
    - Password is validated for strength
    - Email must be unique
    """
    request_id = generate_request_id()

    email = request.data.get("email")
    password = request.data.get("password")
    confirm_password = request.data.get("confirm_password")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")

    errors = {}

    if not email:
        errors["email"] = ["Email is required"]
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = ["Enter a valid email address"]

    if not password:
        errors["password"] = ["Password is required"]
    elif len(password) < 8:
        errors["password"] = ["Password must be at least 8 characters long"]

    if not confirm_password:
        errors["confirm_password"] = ["Confirm password is required"]
    elif password and confirm_password and password != confirm_password:
        errors["confirm_password"] = ["Passwords do not match"]

    if errors:
        return error_response(
            message="Registration failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return error_response(
            message="Registration failed",
            errors={"email": ["A user with this email already exists."]},
            status_code=status.HTTP_409_CONFLICT,
            code="EMAIL_EXISTS",
            request_id=request_id,
        )

    # Validate password strength (uppercase, lowercase, numbers, special chars)
    try:
        validate_and_hash_password(password)
    except ValidationError as e:
        return error_response(
            message="Registration failed",
            errors=e.message_dict,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    # Get client IP for OTP auditing (passed to signal)
    client_ip = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "")

    try:
        with transaction.atomic():
            # Create the user with email and password
            # Signal will automatically create UserAccount
            user = User.objects.create_user(email=email, password=password)

            # Update the account with first_name and last_name
            # Account was created by signal, we just update it
            account = user.account
            account.first_name = first_name
            account.last_name = last_name
            # Store IP and user_agent for OTP creation (will be used in signal)
            # We need to pass these to the signal somehow
            # For now, we'll create OTP here or use a custom signal with kwargs
            account.save(update_fields=["first_name", "last_name"])

            logger.info(f"New user registered: {email}")

        from apps.accounts.constants import OTPType
        from apps.accounts.utils.otp_utils import create_otp
        from apps.notifications.services.email_service import EmailService

        # Create verification OTP (32-character token)
        otp = create_otp(
            user=user,
            otp_type=OTPType.EMAIL_VERIFICATION,
            target=email,
            ip_address=client_ip,
            user_agent=user_agent,
        )

        # Build user_name for email personalization
        user_name = f"{first_name} {last_name}".strip() or email.split("@")[0]

        # Queue verification email with token URL
        EmailService.send_verification_email(
            email=email, token=otp.otp_code, user_name=user_name
        )

        # Queue welcome email
        EmailService.send_welcome_email(email=email, user_name=user_name)

        logger.info(f"Verification and welcome emails queued for {email}")

        return success_response(
            message="User registered successfully. Please verify your email.",
            data={"email": user.email},
            status_code=status.HTTP_201_CREATED,
            code="REGISTRATION_SUCCESS",
            request_id=request_id,
        )

    except IntegrityError as e:
        logger.exception(f"Registration integrity error: {e}")
        return error_response(
            message="Registration failed",
            errors="An error occurred. Please try again.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="REGISTRATION_ERROR",
            request_id=request_id,
        )
    except Exception as e:
        logger.exception(f"Unexpected registration error: {e}")
        return error_response(
            message="Registration failed",
            errors="An unexpected error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="REGISTRATION_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Customer login endpoint.

    Authenticates user and sets authentication cookies.

    Manual validation:
    - Email and password are required
    """
    request_id = generate_request_id()

    email = request.data.get("email")
    password = request.data.get("password")

    errors = {}

    if not email:
        errors["email"] = ["Email is required"]
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = ["Enter a valid email address"]

    if not password:
        errors["password"] = ["Password is required"]

    if errors:
        return error_response(
            message="Login failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        user, account, error = AuthService.authenticate_user(
            email=email,
            password=password,
            ip_address=request.META.get("REMOTE_ADDR"),
        )
    except Exception as e:
        logger.exception(f"Unexpected login error: {e}")
        return error_response(
            message="Login failed",
            errors="An unexpected error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="LOGIN_ERROR",
            request_id=request_id,
        )

    if error:
        return error_response(
            message=error["error"],
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=error.get("code", "AUTHENTICATION_FAILED"),
            request_id=request_id,
        )

    response = success_response(
        message="Login successful",
        data={"email": user.email, "role": account.role},
        status_code=status.HTTP_200_OK,
        code="LOGIN_SUCCESS",
        request_id=request_id,
    )

    try:
        return AuthService.create_auth_response(response, user, request)
    except Exception as e:
        logger.exception(f"Error creating auth response: {e}")
        return error_response(
            message="Login failed",
            errors="Error creating session",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="SESSION_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def operator_login(request):
    """
    Operator (staff) login endpoint.

    Uses obscure endpoint name for security through obscurity.
    Only users with operator role can log in here.

    Manual validation:
    - Email and password are required
    """
    request_id = generate_request_id()

    # Manual validation of required fields
    email = request.data.get("email")
    password = request.data.get("password")

    errors = {}

    if not email:
        errors["email"] = ["Email is required"]
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = ["Enter a valid email address"]

    if not password:
        errors["password"] = ["Password is required"]

    if errors:
        return error_response(
            message="Login failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        user, account, error = AuthService.validate_operator_login(
            email=email,
            password=password,
            ip_address=request.META.get("REMOTE_ADDR"),
        )
    except Exception as e:
        logger.exception(f"Unexpected operator login error: {e}")
        return error_response(
            message="Login failed",
            errors="An unexpected error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="LOGIN_ERROR",
            request_id=request_id,
        )

    if error:
        return error_response(
            message=error["error"],
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=error.get("code", "AUTHENTICATION_FAILED"),
            request_id=request_id,
        )

    response = success_response(
        message="Operator login successful",
        data={"email": user.email, "role": account.role},
        status_code=status.HTTP_200_OK,
        code="LOGIN_SUCCESS",
        request_id=request_id,
    )

    try:
        return AuthService.create_auth_response(response, user, request)
    except Exception as e:
        logger.exception(f"Error creating auth response: {e}")
        return error_response(
            message="Login failed",
            errors="Error creating session",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="SESSION_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout endpoint.

    Clears authentication cookies.
    """
    request_id = generate_request_id()

    try:
        response = success_response(
            message="Logged out successfully",
            status_code=status.HTTP_200_OK,
            code="LOGOUT_SUCCESS",
            request_id=request_id,
        )
        return AuthService.logout_user(response)
    except Exception as e:
        logger.exception(f"Error during logout: {e}")
        return error_response(
            message="Logout failed",
            errors="An error occurred during logout.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="LOGOUT_ERROR",
            request_id=request_id,
        )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Get or update user profile.

    GET: Returns current user profile using UserAccountSerializer
    PATCH: Updates profile fields (first_name, last_name, phone_number)

    Manual validation for PATCH:
    - Only allowed fields are validated
    """
    request_id = generate_request_id()

    if request.method == "GET":
        try:
            serializer = UserAccountSerializer(request.user.account)
            return success_response(
                message="Profile retrieved",
                data=serializer.data,
                status_code=status.HTTP_200_OK,
                request_id=request_id,
            )
        except Exception as e:
            logger.exception(f"Error retrieving profile: {e}")
            return error_response(
                message="Failed to retrieve profile",
                errors="An error occurred.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                code="PROFILE_ERROR",
                request_id=request_id,
            )

    # PATCH method - manual validation
    data = {}
    errors = {}

    # Only allow specific fields to be updated
    allowed_fields = ["first_name", "last_name", "phone_number"]

    for field in allowed_fields:
        if field in request.data:
            data[field] = request.data[field]

    if not data:
        errors["fields"] = ["No valid fields to update"]

    if errors:
        return error_response(
            message="Profile update failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        account = AccountService.update_profile(request.user.account, data)

        # Return updated data using UserAccountSerializer
        serializer = UserAccountSerializer(account)
        return success_response(
            message="Profile updated successfully",
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            code="PROFILE_UPDATED",
            request_id=request_id,
        )
    except Exception as e:
        logger.exception(f"Error updating profile: {e}")
        return error_response(
            message="Profile update failed",
            errors="An error occurred while updating your profile.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PROFILE_UPDATE_ERROR",
            request_id=request_id,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password.

    Manual validation:
    - Current password is required
    - New password is required
    - Current password must be correct
    - New password must meet strength requirements
    """
    request_id = generate_request_id()

    # Manual validation
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    errors = {}

    if not current_password:
        errors["current_password"] = ["Current password is required"]

    if not new_password:
        errors["new_password"] = ["New password is required"]

    if errors:
        return error_response(
            message="Password change failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        AccountService.change_password(
            user=request.user,
            current_password=current_password,
            new_password=new_password,
        )
    except ValidationError as e:
        return error_response(
            message="Password change failed",
            errors=e.message_dict,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )
    except Exception as e:
        logger.exception(f"Error changing password: {e}")
        return error_response(
            message="Password change failed",
            errors="An error occurred while changing your password.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="PASSWORD_CHANGE_ERROR",
            request_id=request_id,
        )

    return success_response(
        message="Password changed successfully",
        status_code=status.HTTP_200_OK,
        code="PASSWORD_CHANGED",
        request_id=request_id,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def request_otp(request):
    """
    Request OTP for verification.

    Supports email verification and password reset flows.

    Manual validation:
    - Email is required and must be valid format
    - OTP type is required and must be valid
    """
    request_id = generate_request_id()

    # Manual validation
    email = request.data.get("email")
    otp_type = request.data.get("otp_type")

    errors = {}

    if not email:
        errors["email"] = ["Email is required"]

    if not otp_type:
        errors["otp_type"] = ["OTP type is required"]

    # Validate email format
    if email and "@" not in email:
        errors["email"] = ["Enter a valid email address"]

    # Validate OTP type
    from .constants import OTPType

    valid_otp_types = [t[0] for t in OTPType.CHOICES]
    if otp_type and otp_type not in valid_otp_types:
        errors["otp_type"] = [
            f"Invalid OTP type. Must be one of: {', '.join(valid_otp_types)}"
        ]

    if errors:
        return error_response(
            message="OTP request failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        success, data, error = OTPService.request_otp(
            email=email,
            otp_type=otp_type,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )
    except Exception as e:
        logger.exception(f"Error requesting OTP: {e}")
        return error_response(
            message="OTP request failed",
            errors="An error occurred while requesting OTP.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="OTP_REQUEST_ERROR",
            request_id=request_id,
        )

    if error:
        status_code = (
            status.HTTP_429_TOO_MANY_REQUESTS
            if error.get("code") == "RATE_LIMIT_EXCEEDED"
            else status.HTTP_400_BAD_REQUEST
        )
        return error_response(
            message=error.get("error", "OTP request failed"),
            errors=error.get("rate_limit"),
            status_code=status_code,
            code=error.get("code", "OTP_REQUEST_FAILED"),
            request_id=request_id,
        )

    return success_response(
        message=data["message"],
        status_code=status.HTTP_200_OK,
        code="OTP_SENT",
        request_id=request_id,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP code.

    On success, may update verification flags or allow password reset.

    Manual validation:
    - OTP code is required
    """
    request_id = generate_request_id()

    # Manual validation
    otp_code = request.data.get("otp_code")

    errors = {}

    if not otp_code:
        errors["otp_code"] = ["OTP code is required"]

    if errors:
        return error_response(
            message="OTP verification failed",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="VALIDATION_ERROR",
            request_id=request_id,
        )

    try:
        success, data, error, account = OTPService.verify_otp(
            otp_code=otp_code,
            ip_address=request.META.get("REMOTE_ADDR"),
        )
    except Exception as e:
        logger.exception(f"Error verifying OTP: {e}")
        return error_response(
            message="OTP verification failed",
            errors="An error occurred while verifying OTP.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="OTP_VERIFY_ERROR",
            request_id=request_id,
        )

    if error:
        return error_response(
            message=error.get("error", "OTP verification failed"),
            status_code=status.HTTP_400_BAD_REQUEST,
            code=error.get("code", "INVALID_OTP"),
            request_id=request_id,
        )

    return success_response(
        message=data["message"],
        status_code=status.HTTP_200_OK,
        code="OTP_VERIFIED",
        request_id=request_id,
    )
