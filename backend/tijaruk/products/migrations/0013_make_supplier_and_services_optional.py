from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0012_service_service_price"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="supplier",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="products",
                to="supplier.supplier",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="services",
            field=models.ManyToManyField(
                blank=True,
                related_name="products",
                to="products.service",
            ),
        ),
    ]
