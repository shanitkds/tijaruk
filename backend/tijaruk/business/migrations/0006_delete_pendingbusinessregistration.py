from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("business", "0005_business_language_business_user_role"),
    ]

    operations = [
        migrations.DeleteModel(
            name="PendingBusinessRegistration",
        ),
    ]
