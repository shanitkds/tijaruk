from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models
from django.utils import timezone
from superadmin.permissions import IsAdminRole, has_permission

from .models import PermissionModule, Role, User

from .serializers import (
    AdminUserCreateSerializer,
    AdminUserSerializer,
    BecomeUserSerializer,
    GoogleLoginSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ResendOTPSerializer,
    RoleSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    VerifyOTPSerializer,
    serialize_auth_session,
)
from .services import (
    AccountConflictError,
    AccountUnavailableError,
    GoogleAuthenticationError,
    GoogleVerificationUnavailableError,
    OTPCooldownError,
    OTPError,
    PasswordResetError,
    begin_verification,
    begin_login_verification,
    confirm_password_reset,
    ensure_dashboard_account,
    mask_email,
    request_password_reset,
    resend_otp,
    resolve_google_account,
    verify_google_credential,
    verify_otp,
)
from .utils import clear_auth_cookies, set_auth_cookies


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        business_settings = getattr(user, "business_settings", None)
        if user.role == User.Role.BUSINESS and (
            business_settings and business_settings.two_factor_enabled
        ):
            try:
                otp, verification_token = begin_login_verification(user)
            except Exception:
                return Response(
                    {"error": "We could not send the sign-in code. Please try again."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response(
                {
                    "verification_required": True,
                    "verification_token": verification_token,
                    "email": mask_email(user.email),
                    "expires_at": otp.expires_at,
                    "resend_available_at": otp.resend_available_at,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        data = serialize_auth_session(user, request)
        response = Response(data, status=HTTP_200_OK)

        return set_auth_cookies(
            response,
            access_token=data["access"],
            refresh_token=data["refresh"],
        )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        try:
            otp, verification_token = begin_verification(user)
        except Exception:
            user.delete()
            return Response(
                {"error": "We could not send the verification email. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            {
                "verification_required": True,
                "verification_token": verification_token,
                "email": mask_email(user.email),
                "expires_at": otp.expires_at,
                "resend_available_at": otp.resend_available_at,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "google_login"

    def post(self, request, *args, **kwargs):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            claims = verify_google_credential(
                serializer.validated_data["credential"]
            )
            result = resolve_google_account(claims)
            if not result.user.is_verified or not result.user.is_active:
                result.user.is_verified = True
                result.user.is_active = True
                result.user.save(
                    update_fields=["is_verified", "is_active", "updated_at"]
                )
            ensure_dashboard_account(result.user)
        except GoogleAuthenticationError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except GoogleVerificationUnavailableError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except AccountConflictError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )
        except AccountUnavailableError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = serialize_auth_session(result.user, request)
        response = Response(data, status=HTTP_200_OK)
        return set_auth_cookies(
            response,
            access_token=data["access"],
            refresh_token=data["refresh"],
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "verify_otp"

    def post(self, request, *args, **kwargs):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = verify_otp(
                serializer.validated_data["verification_token"],
                serializer.validated_data["otp"],
            )
            ensure_dashboard_account(user)
        except OTPError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except AccountUnavailableError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = serialize_auth_session(user, request)
        response = Response(data, status=HTTP_200_OK)
        return set_auth_cookies(
            response,
            access_token=data["access"],
            refresh_token=data["refresh"],
        )


class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "resend_otp"

    def post(self, request, *args, **kwargs):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            otp, verification_token = resend_otp(
                serializer.validated_data["verification_token"]
            )
        except OTPCooldownError as exc:
            return Response(
                {
                    "error": str(exc),
                    "retry_after": exc.retry_after,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        except OTPError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(
                {
                    "error": (
                        "We could not send the verification email. "
                        "Please try again."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "verification_required": True,
                "verification_token": verification_token,
                "expires_at": otp.expires_at,
                "resend_available_at": otp.resend_available_at,
            },
            status=HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"

        try:
            request_password_reset(
                serializer.validated_data["email"],
                reset_url,
            )
        except Exception:
            return Response(
                {"error": "We could not send the reset email. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {"detail": "If an account exists, we sent a reset link."},
            status=HTTP_200_OK,
        )


class PasswordChangeView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Your password has been changed successfully."},
            status=HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            confirm_password_reset(
                serializer.validated_data["token"],
                serializer.validated_data["password"],
            )
        except PasswordResetError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except DjangoValidationError as exc:
            return Response(
                {"password": list(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Your password has been reset. You can sign in now."},
            status=HTTP_200_OK,
        )


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            refresh = RefreshToken(refresh_token)
            user = User.objects.filter(
                pk=refresh["user_id"],
                is_active=True,
                is_archived=False,
            ).first()
            if user is None:
                return Response(
                    {"error": "Account is inactive or archived"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            access_token = str(refresh.access_token)

            response = Response(
                {
                    "access": access_token
                },
                status=status.HTTP_200_OK
            )

            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                path="/",
            )

            return response

        except Exception:
            return Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh")

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        response = Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
        return clear_auth_cookies(response)


class BecomeUserView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = BecomeUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if user.role != User.Role.BUSINESS:
            return Response(
                {"error": "Only business accounts can become users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user.role_type == User.RoleType.GUEST:
            user.role_type = User.RoleType.USER
            if user.terms_accepted_at is None:
                user.terms_accepted_at = timezone.now()
                user.save(update_fields=["role_type", "terms_accepted_at", "updated_at"])
            else:
                user.save(update_fields=["role_type", "updated_at"])

        data = serialize_auth_session(user, request)
        response = Response(data, status=HTTP_200_OK)
        return set_auth_cookies(
            response,
            access_token=data["access"],
            refresh_token=data["refresh"],
        )


class UserProfileView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(
            request.user,
            context={"request": request},
        )
        return Response(serializer.data, status=HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=HTTP_200_OK)



class HasUsersPermission(BasePermission):
    def has_permission(self, request, view):
        action = {
            "GET": "view",
            "POST": "create",
            "PUT": "edit",
            "PATCH": "edit",
            "DELETE": "delete",
        }.get(request.method, "view")
        return has_permission(request.user, PermissionModule.USERS, action)


class AdminUserListCreateView(ListCreateAPIView):
    permission_classes = [HasUsersPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = (
            User.objects.filter(
                role__in=[
                    User.Role.ADMIN,
                    User.Role.INTERNAL_STAFF,
                    User.Role.BUSINESS,
                ],
                is_archived=False,
            )
            .select_related("staff_profile__role_obj", "business_profile")
            .order_by("-date_joined")
        )
        search = self.request.query_params.get("search", "").strip()
        status_filter = self.request.query_params.get("status", "").strip().lower()
        role_id = self.request.query_params.get("role", "").strip()

        if search:
            queryset = queryset.filter(
                models.Q(full_name__icontains=search)
                | models.Q(username__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(user_id__icontains=search)
            )

        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)

        if role_id:
            role_id_upper = role_id.upper()
            if role_id_upper == User.RoleType.GUEST:
                queryset = queryset.filter(
                    role=User.Role.BUSINESS,
                    role_type=User.RoleType.GUEST,
                )
            elif role_id_upper == User.Role.BUSINESS:
                queryset = queryset.filter(
                    role=User.Role.BUSINESS,
                    role_type=User.RoleType.USER,
                )
            elif role_id_upper == User.Role.ADMIN:
                queryset = queryset.filter(role=role_id_upper)
            else:
                queryset = queryset.filter(staff_profile__role_obj_id=role_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminUserCreateSerializer
        return AdminUserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        output = AdminUserSerializer(user, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [HasUsersPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            User.objects.filter(
                role__in=[
                    User.Role.ADMIN,
                    User.Role.INTERNAL_STAFF,
                    User.Role.BUSINESS,
                ],
                is_archived=False,
            )
            .select_related("staff_profile__role_obj", "business_profile")
            .order_by("-date_joined")
        )

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return AdminUserCreateSerializer
        return AdminUserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        output = AdminUserSerializer(user, context=self.get_serializer_context())
        return Response(output.data, status=HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_archived = True
        user.is_active = False
        user.save(update_fields=["is_archived", "is_active", "updated_at"])
        business = getattr(user, "business_profile", None)
        if business:
            business.is_archived = True
            business.save(update_fields=["is_archived", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

class RoleListCreateView(ListCreateAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = RoleSerializer

    def get_queryset(self):
        queryset = Role.objects.prefetch_related("permissions", "staff_members").order_by("-created_at")
        search = self.request.query_params.get("search", "").strip()
        status_filter = self.request.query_params.get("status", "").strip().lower()
        access_level = self.request.query_params.get("access_level", "").strip()

        if search:
            queryset = queryset.filter(role_name__icontains=search)

        if status_filter == "active":
            queryset = queryset.filter(role_status=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(role_status=False)

        if access_level:
            queryset = queryset.filter(access_level=access_level)

        return queryset


class RoleDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = RoleSerializer
    queryset = Role.objects.prefetch_related("permissions", "staff_members")
