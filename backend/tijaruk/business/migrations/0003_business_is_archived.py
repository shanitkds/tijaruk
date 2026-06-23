from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("business", "0002_business_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="business",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
