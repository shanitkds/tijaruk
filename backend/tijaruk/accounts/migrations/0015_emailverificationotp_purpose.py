from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0014_user_role_type")]

    operations = [
        migrations.AddField(
            model_name="emailverificationotp",
            name="purpose",
            field=models.CharField(
                choices=[
                    ("ACCOUNT_VERIFICATION", "Account verification"),
                    ("LOGIN", "Login"),
                ],
                default="ACCOUNT_VERIFICATION",
                max_length=24,
            ),
        ),
    ]
