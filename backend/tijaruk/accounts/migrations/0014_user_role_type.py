from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0013_google_auth_and_email_verification"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="role_type",
            field=models.CharField(
                choices=[("GUEST", "Guest"), ("USER", "User")],
                default="USER",
                max_length=10,
            ),
        ),
    ]
