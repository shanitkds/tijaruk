from django.db import migrations, models


def populate_full_names(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    for user in User.objects.filter(full_name="").iterator():
        inherited_name = f"{user.first_name} {user.last_name}".strip()
        user.full_name = inherited_name or user.username
        user.save(update_fields=["full_name"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0011_user_phone_user_terms_accepted_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="full_name",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.RunPython(populate_full_names, migrations.RunPython.noop),
    ]
