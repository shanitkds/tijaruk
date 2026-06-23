from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("business", "0009_remove_business_profile_fields"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="business",
            name="email",
        ),
        migrations.RemoveField(
            model_name="business",
            name="phone",
        ),
    ]
