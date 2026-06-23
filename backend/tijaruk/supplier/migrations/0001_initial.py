import common.models
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0007_producttype_alter_supplier_product_type"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="ProductType",
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
                        ("name", models.CharField(max_length=100, unique=True)),
                    ],
                    options={"db_table": "accounts_producttype"},
                ),
                migrations.CreateModel(
                    name="Supplier",
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
                        ("full_name", models.CharField(max_length=255)),
                        ("date_of_birth", models.DateField()),
                        (
                            "gender",
                            models.CharField(
                                choices=[
                                    ("MALE", "Male"),
                                    ("FEMALE", "Female"),
                                    ("OTHER", "Other"),
                                ],
                                max_length=20,
                            ),
                        ),
                        ("location", models.CharField(max_length=255)),
                        ("phone", models.CharField(max_length=20)),
                        ("supplier_name", models.CharField(max_length=255)),
                        (
                            "supplier_description",
                            models.TextField(blank=True, null=True),
                        ),
                        ("email", models.EmailField(max_length=254, unique=True)),
                        ("website", models.URLField(blank=True, null=True)),
                        (
                            "supplier_status",
                            models.CharField(
                                choices=[
                                    ("ACTIVE", "Active"),
                                    ("INACTIVE", "Inactive"),
                                    ("PENDING", "Pending"),
                                ],
                                default="PENDING",
                                max_length=20,
                            ),
                        ),
                        (
                            "supplier_rating",
                            models.DecimalField(
                                decimal_places=1,
                                default=0.0,
                                max_digits=2,
                            ),
                        ),
                        (
                            "logo",
                            models.ImageField(
                                blank=True,
                                null=True,
                                upload_to="suppliers/logos/",
                                validators=[common.models.validate_image_file],
                            ),
                        ),
                        (
                            "payment_terms",
                            models.CharField(blank=True, max_length=255, null=True),
                        ),
                        (
                            "minimum_order_quantity",
                            models.PositiveIntegerField(default=0),
                        ),
                        (
                            "product_type",
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.PROTECT,
                                related_name="suppliers",
                                to="supplier.producttype",
                            ),
                        ),
                    ],
                    options={"db_table": "accounts_supplier"},
                ),
            ],
            database_operations=[],
        ),
    ]
