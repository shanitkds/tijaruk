# Generated to move internal staff role ownership into the accounts app.

import django.db.models.deletion
from django.db import migrations, models


def copy_superadmin_roles_to_accounts(apps, schema_editor):
    OldRole = apps.get_model("superadmin", "Role")
    OldRolePermission = apps.get_model("superadmin", "RolePermission")
    NewRole = apps.get_model("accounts", "Role")
    NewRolePermission = apps.get_model("accounts", "RolePermission")

    for old_role in OldRole.objects.all():
        NewRole.objects.update_or_create(
            id=old_role.id,
            defaults={
                "created_at": old_role.created_at,
                "updated_at": old_role.updated_at,
                "role_name": old_role.role_name,
                "access_level": old_role.access_level,
                "role_status": old_role.role_status,
            },
        )

    for old_permission in OldRolePermission.objects.all():
        NewRolePermission.objects.update_or_create(
            id=old_permission.id,
            defaults={
                "created_at": old_permission.created_at,
                "updated_at": old_permission.updated_at,
                "role_id": old_permission.role_id,
                "module": old_permission.module,
                "can_view": old_permission.can_view,
                "can_create": old_permission.can_create,
                "can_edit": old_permission.can_edit,
                "can_delete": old_permission.can_delete,
                "can_approve": old_permission.can_approve,
                "can_export": old_permission.can_export,
                "full_access": old_permission.full_access,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ("superadmin", "0002_rolepermission"),
        ("accounts", "0013_google_auth_and_email_verification"),
    ]

    operations = [
        migrations.CreateModel(
            name="Role",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("role_name", models.CharField(max_length=100, unique=True)),
                (
                    "access_level",
                    models.CharField(
                        choices=[
                            ("FULL_ACCESS", "Full Access"),
                            ("CUSTOM_ACCESS", "Custom Access"),
                        ],
                        default="CUSTOM_ACCESS",
                        max_length=20,
                    ),
                ),
                ("role_status", models.BooleanField(default=True)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="RolePermission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "module",
                    models.CharField(
                        choices=[
                            ("dashboard", "Dashboard"),
                            ("rfqs", "RFQs"),
                            ("products", "Products"),
                            ("business", "Business"),
                            ("suppliers", "Suppliers"),
                            ("users", "Users"),
                            ("roles", "Roles"),
                            ("reports", "Reports"),
                            ("general_settings", "General Settings"),
                            ("account_settings", "Account Settings"),
                            ("notification_settings", "Notification Settings"),
                            ("security_settings", "Security Settings"),
                            ("language_settings", "Language Settings"),
                        ],
                        max_length=30,
                    ),
                ),
                ("can_view", models.BooleanField(default=False)),
                ("can_create", models.BooleanField(default=False)),
                ("can_edit", models.BooleanField(default=False)),
                ("can_delete", models.BooleanField(default=False)),
                ("can_approve", models.BooleanField(default=False)),
                ("can_export", models.BooleanField(default=False)),
                ("full_access", models.BooleanField(default=False)),
                (
                    "role",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="permissions",
                        to="accounts.role",
                    ),
                ),
            ],
            options={
                "ordering": ["module"],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("role", "module"),
                        name="unique_accounts_role_permission_module",
                    )
                ],
            },
        ),
        migrations.RunPython(copy_superadmin_roles_to_accounts, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="internalstaff",
            name="role_obj",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="staff_members",
                to="accounts.role",
            ),
        ),
    ]
