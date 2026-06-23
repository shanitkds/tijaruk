from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0005_productinternalimage"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
