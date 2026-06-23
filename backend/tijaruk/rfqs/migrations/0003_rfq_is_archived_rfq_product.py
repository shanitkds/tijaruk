import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0006_product_is_archived"),
        ("rfqs", "0002_rfq_created_by_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="rfq",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="rfq",
            name="product",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="rfqs",
                to="products.product",
            ),
        ),
    ]
