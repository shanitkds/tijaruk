import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def assign_existing_rfqs(apps, schema_editor):
    RFQ = apps.get_model("rfqs", "RFQ")
    User = apps.get_model(*settings.AUTH_USER_MODEL.split("."))
    owner = User.objects.filter(role="ADMIN").order_by("pk").first()

    if not owner and RFQ.objects.exists():
        owner = User.objects.order_by("pk").first()

    if owner:
        RFQ.objects.filter(created_by__isnull=True).update(created_by=owner)


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("rfqs", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="rfq",
            name="created_by",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="rfqs",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="rfq",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("APPROVED", "Approved"),
                    ("REJECTED", "Rejected"),
                ],
                default="PENDING",
                max_length=20,
            ),
        ),
        migrations.RunPython(assign_existing_rfqs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="rfq",
            name="created_by",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="rfqs",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
