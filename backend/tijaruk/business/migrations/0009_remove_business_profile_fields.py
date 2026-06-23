from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("business", "0008_businessusersettings_notifications"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="business",
            name="business_name",
        ),
        migrations.RemoveField(
            model_name="business",
            name="cr_number",
        ),
        migrations.RemoveField(
            model_name="business",
            name="business_type",
        ),
        migrations.RemoveField(
            model_name="business",
            name="industry",
        ),
        migrations.RemoveField(
            model_name="business",
            name="business_status",
        ),
        migrations.RemoveField(
            model_name="business",
            name="business_description",
        ),
        migrations.RemoveField(
            model_name="business",
            name="website",
        ),
        migrations.RemoveField(
            model_name="business",
            name="logo",
        ),
        migrations.RemoveField(
            model_name="business",
            name="contact_person",
        ),
        migrations.RemoveField(
            model_name="business",
            name="user_role",
        ),
        migrations.DeleteModel(
            name="BusinessType",
        ),
        migrations.DeleteModel(
            name="Industry",
        ),
    ]
