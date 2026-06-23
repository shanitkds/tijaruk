import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def ensure_suppliers_have_users(apps, schema_editor):
    Supplier = apps.get_model("supplier", "Supplier")
    if Supplier.objects.filter(user__isnull=True).exists():
        raise RuntimeError(
            "Assign a user to every existing supplier before applying this migration."
        )


class Migration(migrations.Migration):
    dependencies = [
        ("supplier", "0002_supplier_user"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(
            ensure_suppliers_have_users,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="supplier",
            name="user",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="supplier_profile",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
