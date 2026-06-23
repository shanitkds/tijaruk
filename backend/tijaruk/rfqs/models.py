from django.db import models
from django.conf import settings
from common.models import TimeStampedModel



class Unit(TimeStampedModel):
    name = models.CharField(
        max_length=50,
        unique=True
    )

    def __str__(self):
        return self.name


class Country(TimeStampedModel):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.name


class RFQ(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rfqs",
    )

    rfq_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        null=True,
        blank=True,
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="rfqs",
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    is_archived = models.BooleanField(default=False)

    stock_deducted = models.BooleanField(default=False)

    quantity_required = models.PositiveIntegerField()

    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="rfqs"
    )

    target_delivery_date = models.DateField()

    preferred_country_of_origin = models.ForeignKey(
        Country,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="origin_rfqs"
    )

    additional_service = models.ForeignKey(
        "products.Service",
        on_delete=models.PROTECT,
        related_name="rfqs",
        null=True,
        blank=True
    )

    additional_details = models.TextField(
        blank=True
    )

    attachment = models.FileField(
        upload_to="rfqs/",
        null=True,
        blank=True
    )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.rfq_id:
            self.rfq_id = f"RFQ-{self.pk:05d}"
            type(self).objects.filter(pk=self.pk).update(rfq_id=self.rfq_id)

    def __str__(self):
        return f"{self.rfq_id or f'RFQ-{self.pk}'} - {self.status}"

