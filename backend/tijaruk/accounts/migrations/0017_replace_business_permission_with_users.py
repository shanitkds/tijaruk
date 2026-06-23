from django.db import migrations, models


PERMISSION_FIELDS = (
    "can_view",
    "can_create",
    "can_edit",
    "can_delete",
    "can_approve",
    "can_export",
    "full_access",
)


def move_permission(RolePermission, source, target):
    for source_permission in RolePermission.objects.filter(module=source):
        target_permission = RolePermission.objects.filter(
            role_id=source_permission.role_id,
            module=target,
        ).first()

        if target_permission:
            changed_fields = []
            for field in PERMISSION_FIELDS:
                merged_value = getattr(target_permission, field) or getattr(
                    source_permission,
                    field,
                )
                if getattr(target_permission, field) != merged_value:
                    setattr(target_permission, field, merged_value)
                    changed_fields.append(field)
            if changed_fields:
                target_permission.save(update_fields=changed_fields)
            source_permission.delete()
        else:
            source_permission.module = target
            source_permission.save(update_fields=["module"])


def forwards(apps, schema_editor):
    RolePermission = apps.get_model("accounts", "RolePermission")
    # The previous UI stored Messages as "users" and Businesses as "business".
    move_permission(RolePermission, "users", "messages")
    move_permission(RolePermission, "business", "users")


def backwards(apps, schema_editor):
    RolePermission = apps.get_model("accounts", "RolePermission")
    move_permission(RolePermission, "users", "business")
    move_permission(RolePermission, "messages", "users")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0016_merge_20260623_1033"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name="rolepermission",
            name="module",
            field=models.CharField(
                choices=[
                    ("dashboard", "Dashboard"),
                    ("rfqs", "RFQs"),
                    ("products", "Products"),
                    ("suppliers", "Suppliers"),
                    ("users", "Users"),
                    ("messages", "Messages"),
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
    ]
