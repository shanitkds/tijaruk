from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rfqs", "0005_rfq_additional_service_delete_additionalservice"),
    ]

    operations = [
        migrations.AddField(
            model_name="rfq",
            name="stock_deducted",
            field=models.BooleanField(default=False),
        ),
    ]
