import secrets

from common.models import BasePersonInfo, TimeStampedModel, validate_image_file
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import IntegrityError, models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email address must be set.")
        if not extra_fields.get("username"):
            raise ValueError("The username must be set.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if extra_fields.get("role") != User.Role.ADMIN:
            raise ValueError("Superuser must have role=ADMIN.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        INTERNAL_STAFF = "INTERNAL_STAFF", "Internal Staff"
        SUPPLIER = "SUPPLIER", "Supplier"
        BUSINESS = "BUSINESS", "Business"

    class RoleType(models.TextChoices):
        GUEST = "GUEST", "Guest"
        USER = "USER", "User"

    username = models.CharField(max_length=150)
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SUPPLIER)
    role_type = models.CharField(
        max_length=10,
        choices=RoleType.choices,
        default=RoleType.USER,
    )
    user_id = models.CharField(max_length=18, unique=True, blank=True, editable=False)
    phone = models.CharField(max_length=20, blank=True)
    terms_accepted_at = models.DateTimeField(null=True, blank=True, editable=False)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=True)
    photo = models.ImageField(
        upload_to="users/photos/",
        blank=True,
        null=True,
        validators=[validate_image_file],
    )

    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    USER_ID_PREFIXES = {
        Role.ADMIN: "AM",
        Role.INTERNAL_STAFF: "IN",
        Role.SUPPLIER: "SU",
        Role.BUSINESS: "BU",
    }

    def save(self, *args, **kwargs):
        if self.user_id:
            return super().save(*args, **kwargs)

        for _ in range(20):
            self.user_id = self._generate_user_id()
            if not type(self).objects.filter(user_id=self.user_id).exists():
                try:
                    return super().save(*args, **kwargs)
                except IntegrityError:
                    self.user_id = ""

        raise IntegrityError("Could not generate a unique user_id.")

    def _generate_user_id(self):
        prefix = self.USER_ID_PREFIXES.get(self.role, "US")
        token = secrets.token_hex(6).upper()
        return f"{prefix}{token}"

    @property
    def role_obj(self):
        staff_profile = getattr(self, "staff_profile", None)
        return getattr(staff_profile, "role_obj", None)


class EmailVerificationOTP(models.Model):
    class Purpose(models.TextChoices):
        ACCOUNT_VERIFICATION = "ACCOUNT_VERIFICATION", "Account verification"
        LOGIN = "LOGIN", "Login"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verification_otps",
    )
    code_hash = models.CharField(max_length=64)
    purpose = models.CharField(
        max_length=24,
        choices=Purpose.choices,
        default=Purpose.ACCOUNT_VERIFICATION,
    )
    expires_at = models.DateTimeField()
    failed_attempts = models.PositiveSmallIntegerField(default=0)
    resend_available_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    consumed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(
                fields=("user", "consumed_at", "created_at"),
                name="accounts_em_user_id_99db51_idx",
            ),
        ]


class Role(TimeStampedModel):
    class AccessLevel(models.TextChoices):
        FULL_ACCESS = "FULL_ACCESS", "Full Access"
        CUSTOM_ACCESS = "CUSTOM_ACCESS", "Custom Access"

    role_name = models.CharField(max_length=100, unique=True)
    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.CUSTOM_ACCESS,
    )
    role_status = models.BooleanField(default=True)

    def __str__(self):
        return self.role_name


class PermissionModule(models.TextChoices):
    DASHBOARD = "dashboard", "Dashboard"
    RFQS = "rfqs", "RFQs"
    PRODUCTS = "products", "Products"
    SUPPLIERS = "suppliers", "Suppliers"
    USERS = "users", "Users"
    MESSAGES = "messages", "Messages"
    ROLES = "roles", "Roles"
    REPORTS = "reports", "Reports"
    GENERAL_SETTINGS = "general_settings", "General Settings"
    ACCOUNT_SETTINGS = "account_settings", "Account Settings"
    NOTIFICATION_SETTINGS = "notification_settings", "Notification Settings"
    SECURITY_SETTINGS = "security_settings", "Security Settings"
    LANGUAGE_SETTINGS = "language_settings", "Language Settings"


class RolePermission(TimeStampedModel):
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="permissions",
    )
    module = models.CharField(max_length=30, choices=PermissionModule.choices)
    can_view = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    can_approve = models.BooleanField(default=False)
    can_export = models.BooleanField(default=False)
    full_access = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "module"],
                name="unique_accounts_role_permission_module",
            ),
        ]
        ordering = ["module"]

    def has_permission(self, action):
        if self.full_access:
            return True

        permission_field = f"can_{action}"
        if permission_field == "can_update":
            permission_field = "can_edit"

        return bool(getattr(self, permission_field, False))

    def __str__(self):
        return f"{self.role} - {self.get_module_display()}"


class InternalStaff(BasePersonInfo):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="staff_profile",
    )
    role_obj = models.ForeignKey(
        "accounts.Role",
        on_delete=models.PROTECT,
        related_name="staff_members",
    )

    def __str__(self):
        return self.full_name
