from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("business", "0004_pendingbusinessregistration"),
    ]

    operations = [
        migrations.AddField(
            model_name="business",
            name="language",
            field=models.CharField(blank=True, default="English (EN)", max_length=100),
        ),
        migrations.AddField(
            model_name="business",
            name="user_role",
            field=models.CharField(blank=True, default="Business User", max_length=100),
        ),
    ]
