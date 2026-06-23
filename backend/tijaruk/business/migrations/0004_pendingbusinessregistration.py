from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0013_google_auth_and_email_verification"),
        ("business", "0003_business_is_archived"),
    ]

    operations = [
        migrations.CreateModel(
            name="PendingBusinessRegistration",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("business_name", models.CharField(max_length=255)),
                ("cr_number", models.CharField(max_length=50, unique=True)),
                ("business_description", models.TextField()),
                ("location", models.CharField(max_length=255)),
                ("website", models.URLField(blank=True, null=True)),
                (
                    "business_type",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="pending_registrations",
                        to="business.businesstype",
                    ),
                ),
                (
                    "industry",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="pending_registrations",
                        to="business.industry",
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pending_business_registration",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"abstract": False},
        ),
    ]
