from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("business", "0007_businessusersettings")]

    operations = [
        migrations.AddField(
            model_name="businessusersettings",
            name="email_notifications",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="businessusersettings",
            name="new_rfq_responses",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="businessusersettings",
            name="order_status_updates",
            field=models.BooleanField(default=True),
        ),
    ]
