from common.models import BasePersonInfo, validate_image_file
from django.conf import settings
from django.db import models


class ProductType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "accounts_producttype"

    def __str__(self):
        return self.name


class Supplier(BasePersonInfo):
    class SupplierStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        PENDING = "PENDING", "Pending"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="supplier_profile",
    )
    supplier_name = models.CharField(max_length=255)
    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.PROTECT,
        related_name="suppliers",
    )
    supplier_description = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    website = models.URLField(blank=True, null=True)
    supplier_status = models.CharField(
        max_length=20,
        choices=SupplierStatus.choices,
        default=SupplierStatus.PENDING,
    )
    supplier_rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0.0,
    )
    logo = models.ImageField(
        upload_to="suppliers/logos/",
        blank=True,
        null=True,
        validators=[validate_image_file],
    )
    payment_terms = models.CharField(max_length=255, blank=True, null=True)
    minimum_order_quantity = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "accounts_supplier"

    def __str__(self):
        return self.supplier_name
