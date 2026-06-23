from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0008_move_supplier_models_to_supplier_app"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
