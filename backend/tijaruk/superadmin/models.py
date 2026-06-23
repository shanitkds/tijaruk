from common.models import TimeStampedModel
from django.db import models


class Role(TimeStampedModel):

    class AccessLevel(models.TextChoices):
        FULL_ACCESS = "FULL_ACCESS", "Full Access"
        CUSTOM_ACCESS = "CUSTOM_ACCESS", "Custom Access"

    role_name = models.CharField(max_length=100, unique=True)

    access_level = models.CharField(
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.CUSTOM_ACCESS
    )

    role_status = models.BooleanField(default=True)

    def __str__(self):
        return self.role_name


class PermissionModule(models.TextChoices):
    DASHBOARD = "dashboard", "Dashboard"
    RFQS = "rfqs", "RFQs"
    PRODUCTS = "products", "Products"
    BUSINESS = "business", "Business"
    SUPPLIERS = "suppliers", "Suppliers"
    USERS = "users", "Users"
    ROLES = "roles", "Roles"
    REPORTS = "reports", "Reports"
    GENERAL_SETTINGS = "general_settings", "General Settings"
    ACCOUNT_SETTINGS = "account_settings", "Account Settings"
    NOTIFICATION_SETTINGS = "notification_settings", "Notification Settings"
    SECURITY_SETTINGS = "security_settings", "Security Settings"
    LANGUAGE_SETTINGS = "language_settings", "Language Settings"
    MESSAGES = "messages", "Messages"


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
                name="unique_role_permission_module",
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
