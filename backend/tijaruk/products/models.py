from django.db import models
from common.models import TimeStampedModel, validate_image_file
from rfqs.models import Unit
from supplier.models import Supplier

# Category
class Category(TimeStampedModel):
    category_name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.category_name
    
    
#  Service   
class Service(TimeStampedModel):
    service_name = models.CharField(
        max_length=100,
        unique=True
    )
    service_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    short_description = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return self.service_name 
       
class Product(TimeStampedModel):

    class ProductStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    class ProductType(models.TextChoices):
        DOMESTIC = "DOMESTIC", "Domestic"
        INTERNATIONAL = "INTERNATIONAL", "International"

    product_name = models.CharField(
        max_length=255
    )

    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.DOMESTIC
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products"
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    image = models.ImageField(
        upload_to="products/images/",
        blank=True,
        null=True,
        validators=[validate_image_file],
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    stock_quantity = models.PositiveIntegerField(
        default=0
    )

    minimum_quantity = models.PositiveIntegerField(
        default=0
    )
    
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="products",
        null=True,
        blank=True,
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        related_name="products",
        null=True,
        blank=True,
    )

    services = models.ManyToManyField(
        Service,
        related_name="products",
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.ACTIVE
    )

    is_archived = models.BooleanField(default=False)

    shipping_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return self.product_name


class ProductInternalImage(TimeStampedModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="internal_images",
    )
    image = models.ImageField(
        upload_to="products/internal_images/",
        validators=[validate_image_file],
    )

    def __str__(self):
        return f"{self.product.product_name} internal image"
