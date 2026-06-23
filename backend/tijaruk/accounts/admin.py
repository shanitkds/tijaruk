from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import EmailVerificationOTP, InternalStaff, Role, RolePermission, User


class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 0
    fields = (
        "module",
        "full_access",
        "can_view",
        "can_create",
        "can_edit",
        "can_delete",
        "can_approve",
        "can_export",
    )


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Account info",
            {
                "fields": (
                    "full_name",
                    "phone",
                    "role",
                    "role_type",
                    "user_id",
                    "photo",
                    "terms_accepted_at",
                    "google_id",
                    "is_verified",
                    "is_archived",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "full_name",
                    "phone",
                    "password1",
                    "password2",
                    "role",
                    "role_type",
                ),
            },
        ),
    )
    list_display = (
        "email",
        "full_name",
        "role",
        "role_type",
        "user_id",
        "is_staff",
        "is_active",
        "is_verified",
        "is_archived",
    )
    list_filter = (
        "role",
        "role_type",
        "is_staff",
        "is_active",
        "is_verified",
        "is_archived",
        "is_superuser",
    )
    ordering = ("email",)
    readonly_fields = ("user_id", "terms_accepted_at")
    search_fields = ("email", "username", "full_name", "user_id", "google_id")


@admin.register(EmailVerificationOTP)
class EmailVerificationOTPAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "expires_at",
        "failed_attempts",
        "resend_available_at",
        "consumed_at",
    )
    readonly_fields = (
        "user",
        "code_hash",
        "expires_at",
        "failed_attempts",
        "resend_available_at",
        "created_at",
        "consumed_at",
    )
    search_fields = ("user__email",)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("role_name", "access_level", "role_status", "created_at")
    list_filter = ("access_level", "role_status")
    search_fields = ("role_name",)
    inlines = (RolePermissionInline,)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = (
        "role",
        "module",
        "full_access",
        "can_view",
        "can_create",
        "can_edit",
        "can_delete",
        "can_approve",
        "can_export",
    )
    list_filter = ("module", "full_access", "role")
    search_fields = ("role__role_name", "module")


@admin.register(InternalStaff)
class InternalStaffAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "role_obj", "phone", "location")
    list_filter = ("role_obj", "gender")
    search_fields = ("full_name", "phone", "user__email")
