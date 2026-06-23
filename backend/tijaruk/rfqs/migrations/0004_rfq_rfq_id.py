from django.db import migrations, models


def populate_rfq_ids(apps, schema_editor):
    RFQ = apps.get_model("rfqs", "RFQ")
    for rfq in RFQ.objects.filter(rfq_id__isnull=True).iterator():
        rfq.rfq_id = f"RFQ-{rfq.pk:05d}"
        rfq.save(update_fields=["rfq_id"])


class Migration(migrations.Migration):
    dependencies = [
        ("rfqs", "0003_rfq_is_archived_rfq_product"),
    ]

    operations = [
        migrations.AddField(
            model_name="rfq",
            name="rfq_id",
            field=models.CharField(
                blank=True,
                editable=False,
                max_length=20,
                null=True,
                unique=True,
            ),
        ),
        migrations.RunPython(populate_rfq_ids, migrations.RunPython.noop),
    ]
