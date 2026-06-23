from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from datetime import date
from django.core.validators import RegexValidator
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import InternalStaff, PermissionModule, Role, RolePermission
from business.models import Business

User = get_user_model()


def serialize_auth_session(user, request):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "role_type": user.role_type,
            "photo": request.build_absolute_uri(user.photo.url)
            if user.photo
            else "",
        },
    }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        user = authenticate(
            username=data["email"],
            password=data["password"]
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid Email or Password"
            )

        if user.is_archived:
            raise serializers.ValidationError(
                "This account has been archived."
            )

        allowed_roles = {
            User.Role.ADMIN,
            User.Role.INTERNAL_STAFF,
            User.Role.BUSINESS,
        }
        if user.role not in allowed_roles:
            raise serializers.ValidationError(
                "This account does not have dashboard access."
            )

        return {"user": user}


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    phone = serializers.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r"^\+?\d{9,15}$",
                message="Enter a valid phone number with 9 to 15 digits.",
            )
        ],
    )
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    accepted_terms = serializers.BooleanField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return User.objects.normalize_email(value)

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "The passwords do not match."}
            )
        if not attrs["accepted_terms"]:
            raise serializers.ValidationError(
                {"accepted_terms": "You must accept the Terms and Privacy Policy."}
            )

        validate_password(attrs["password"])
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        validated_data.pop("accepted_terms")
        full_name = validated_data.pop("name").strip()
        password = validated_data.pop("password")
        return User.objects.create_user(
            password=password,
            full_name=full_name,
            role=User.Role.BUSINESS,
            role_type=User.RoleType.USER,
            terms_accepted_at=timezone.now(),
            is_verified=False,
            is_active=False,
            **validated_data,
        )


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(trim_whitespace=False)


class VerifyOTPSerializer(serializers.Serializer):
    verification_token = serializers.CharField(trim_whitespace=False)
    otp = serializers.RegexField(regex=r"^\d{6}$")


class ResendOTPSerializer(serializers.Serializer):
    verification_token = serializers.CharField(trim_whitespace=False)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(trim_whitespace=False)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "The passwords do not match."}
            )
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Your current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "The new passwords do not match."}
            )
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "Choose a password different from your current password."}
            )
        validate_password(attrs["new_password"], self.context["request"].user)
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])
        return user


class BecomeUserSerializer(serializers.Serializer):
    accepted_terms = serializers.BooleanField(write_only=True)

    def validate_accepted_terms(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must accept the Terms and Privacy Policy."
            )
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="full_name", required=False, allow_blank=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "username",
            "email",
            "phone",
            "role",
            "role_type",
            "photo",
            "photo_url",
            "password",
        )
        read_only_fields = ("id", "username", "role", "role_type", "photo_url")
        extra_kwargs = {
            "photo": {"required": False, "allow_null": True},
            "email": {"required": False},
            "phone": {"required": False, "allow_blank": True},
        }

    def get_photo_url(self, obj):
        if not obj.photo:
            return ""

        request = self.context.get("request")
        url = obj.photo.url
        return request.build_absolute_uri(url) if request else url

    def validate_email(self, value):
        user_id = self.instance.pk if self.instance else None
        if User.objects.exclude(pk=user_id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "")
        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])

        return instance



class AdminUserSerializer(serializers.ModelSerializer):
    role_obj = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    business_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "user_id",
            "full_name",
            "username",
            "email",
            "phone",
            "role",
            "role_type",
            "is_active",
            "is_verified",
            "photo_url",
            "role_obj",
            "location",
            "language",
            "business_id",
            "date_joined",
            "updated_at",
        )
        read_only_fields = fields

    def get_role_obj(self, obj):
        role_obj = getattr(obj, "role_obj", None)
        if not role_obj:
            return None
        return {
            "id": role_obj.id,
            "role_name": role_obj.role_name,
        }

    def get_photo_url(self, obj):
        if not obj.photo:
            return ""
        request = self.context.get("request")
        url = obj.photo.url
        return request.build_absolute_uri(url) if request else url

    def get_location(self, obj):
        if obj.role == User.Role.BUSINESS:
            business = getattr(obj, "business_profile", None)
            return business.location if business else ""
        staff_profile = getattr(obj, "staff_profile", None)
        return staff_profile.location if staff_profile else ""

    def get_language(self, obj):
        if obj.role != User.Role.BUSINESS:
            return ""
        business = getattr(obj, "business_profile", None)
        return business.language if business else ""

    def get_business_id(self, obj):
        if obj.role != User.Role.BUSINESS:
            return None
        business = getattr(obj, "business_profile", None)
        return business.id if business else None


class AdminUserCreateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    user_role = serializers.CharField(required=False, allow_blank=True)
    role_obj = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.filter(role_status=True),
        required=False,
        allow_null=True,
    )
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    language = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    def validate_email(self, value):
        queryset = User.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return User.objects.normalize_email(value)

    def validate_username(self, value):
        value = value.strip()
        queryset = User.objects.filter(username__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate(self, attrs):
        password = attrs.get("password", "")
        confirm_password = attrs.get("confirm_password", "")
        if not self.instance and not password:
            raise serializers.ValidationError({"password": "This field is required."})
        if password or confirm_password:
            if password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "The passwords do not match."})
            validate_password(password)

        role_obj = attrs.get("role_obj")
        user_role = attrs.get("user_role", "")
        if role_obj and not user_role:
            attrs["resolved_role"] = User.Role.INTERNAL_STAFF
            attrs["resolved_role_obj"] = role_obj
            return attrs

        normalized_role = user_role.strip().upper()
        if normalized_role in {"ADMIN", User.Role.ADMIN}:
            attrs["resolved_role"] = User.Role.ADMIN
            attrs["resolved_role_obj"] = None
        elif normalized_role in {"BUSINESS", "BUSINESS_USER", User.Role.BUSINESS}:
            attrs["resolved_role"] = User.Role.BUSINESS
            attrs["resolved_role_obj"] = None
        elif normalized_role.startswith("ROLE:"):
            role_id = normalized_role.split(":", 1)[1]
            try:
                attrs["resolved_role_obj"] = Role.objects.get(pk=role_id, role_status=True)
            except Role.DoesNotExist:
                raise serializers.ValidationError({"user_role": "Select a valid role."})
            attrs["resolved_role"] = User.Role.INTERNAL_STAFF
        else:
            raise serializers.ValidationError({"user_role": "Select a valid user role."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("resolved_role")
        role_obj = validated_data.pop("resolved_role_obj", None)
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")
        validated_data.pop("user_role", None)
        validated_data.pop("role_obj", None)
        location = validated_data.pop("location", "")
        language = validated_data.pop("language", "English (EN)")
        is_active = validated_data.pop("is_active", True)
        full_name = validated_data.get("full_name", "").strip()
        phone = validated_data.get("phone", "")

        user = User.objects.create_user(
            password=password,
            role=role,
            role_type=User.RoleType.USER,
            is_active=is_active,
            is_verified=True,
            is_staff=role == User.Role.ADMIN,
            **validated_data,
        )
        self._sync_related_profile(user, role_obj, full_name, phone, location, language)
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        role = validated_data.pop("resolved_role", instance.role)
        role_obj = validated_data.pop("resolved_role_obj", None)
        password = validated_data.pop("password", "")
        validated_data.pop("confirm_password", None)
        validated_data.pop("user_role", None)
        validated_data.pop("role_obj", None)
        location = validated_data.pop("location", "")
        language = validated_data.pop("language", "")
        full_name = validated_data.get("full_name", instance.full_name).strip()
        phone = validated_data.get("phone", instance.phone)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        was_business_guest = (
            instance.role == User.Role.BUSINESS
            and instance.role_type == User.RoleType.GUEST
        )
        instance.role = role
        instance.role_type = (
            User.RoleType.GUEST
            if role == User.Role.BUSINESS and was_business_guest
            else User.RoleType.USER
        )
        instance.is_staff = role == User.Role.ADMIN
        instance.is_verified = True
        if password:
            instance.set_password(password)
        instance.save()
        self._sync_related_profile(instance, role_obj, full_name, phone, location, language)
        return instance

    def _sync_related_profile(self, user, role_obj, full_name, phone, location, language):
        if user.role == User.Role.INTERNAL_STAFF:
            InternalStaff.objects.update_or_create(
                user=user,
                defaults={
                    "role_obj": role_obj,
                    "full_name": full_name,
                    "date_of_birth": date(1900, 1, 1),
                    "gender": InternalStaff.Gender.OTHER,
                    "location": location,
                    "phone": phone,
                },
            )
            Business.objects.filter(user=user).update(is_archived=True)
        elif user.role == User.Role.BUSINESS:
            business_defaults = {"location": location, "is_archived": False}
            if language:
                business_defaults["language"] = language
            Business.objects.update_or_create(
                user=user,
                defaults=business_defaults,
            )
            InternalStaff.objects.filter(user=user).delete()
        else:
            Business.objects.filter(user=user).update(is_archived=True)
            InternalStaff.objects.filter(user=user).delete()

class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = (
            "id",
            "module",
            "can_view",
            "can_create",
            "can_edit",
            "can_delete",
            "can_approve",
            "can_export",
            "full_access",
        )
        read_only_fields = ("id",)


class RoleSerializer(serializers.ModelSerializer):
    permissions = RolePermissionSerializer(many=True)
    assigned_staff_count = serializers.SerializerMethodField()
    access_level_display = serializers.CharField(
        source="get_access_level_display",
        read_only=True,
    )

    class Meta:
        model = Role
        fields = (
            "id",
            "role_name",
            "access_level",
            "access_level_display",
            "role_status",
            "assigned_staff_count",
            "permissions",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "assigned_staff_count")

    def get_assigned_staff_count(self, obj):
        return obj.staff_members.count()

    def validate_permissions(self, value):
        modules = [item["module"] for item in value]
        if len(modules) != len(set(modules)):
            raise serializers.ValidationError("Each permission module can only be added once.")

        valid_modules = {choice[0] for choice in PermissionModule.choices}
        invalid_modules = sorted(set(modules) - valid_modules)
        if invalid_modules:
            raise serializers.ValidationError(f"Invalid modules: {', '.join(invalid_modules)}")

        return value

    @transaction.atomic
    def create(self, validated_data):
        permissions_data = validated_data.pop("permissions", [])
        role = Role.objects.create(**validated_data)
        self._sync_permissions(role, permissions_data)
        return role

    @transaction.atomic
    def update(self, instance, validated_data):
        permissions_data = validated_data.pop("permissions", None)
        instance = super().update(instance, validated_data)

        if permissions_data is not None:
            self._sync_permissions(instance, permissions_data)

        return instance

    def _sync_permissions(self, role, permissions_data):
        existing_permissions = {
            permission.module: permission
            for permission in role.permissions.all()
        }
        incoming_modules = set()

        for permission_data in permissions_data:
            module = permission_data["module"]
            incoming_modules.add(module)
            permission = existing_permissions.get(module)

            if permission:
                for field, value in permission_data.items():
                    setattr(permission, field, value)
                permission.save()
            else:
                RolePermission.objects.create(role=role, **permission_data)

        role.permissions.exclude(module__in=incoming_modules).delete()
