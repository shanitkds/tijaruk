from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0007_producttype_alter_supplier_product_type"),
        ("supplier", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name="Supplier"),
                migrations.DeleteModel(name="ProductType"),
            ],
            database_operations=[],
        ),
    ]
