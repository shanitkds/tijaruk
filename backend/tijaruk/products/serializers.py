from rest_framework import serializers

from supplier.models import Supplier

from .models import Product, ProductInternalImage, Service


class ProductInternalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInternalImage
        fields = ("id", "image")


class ProductSerializer(serializers.ModelSerializer):
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.filter(user__is_archived=False),
        required=False,
        allow_null=True,
    )
    services = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        many=True,
        required=False,
        allow_empty=True,
    )
    category_name = serializers.CharField(source="category.category_name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.supplier_name", read_only=True, allow_null=True)
    supplier_location = serializers.CharField(source="supplier.location", read_only=True, allow_null=True)
    supplier_status = serializers.CharField(source="supplier.supplier_status", read_only=True, allow_null=True)
    supplier_rating = serializers.DecimalField(
        source="supplier.supplier_rating",
        max_digits=2,
        decimal_places=1,
        read_only=True,
        allow_null=True,
    )
    unit_name = serializers.CharField(source="unit.name", read_only=True, allow_null=True)
    internal_images = ProductInternalImageSerializer(many=True, read_only=True)
    service_details = serializers.SerializerMethodField()

    def get_service_details(self, obj):
        return [
            {
                "id": service.id,
                "name": service.service_name,
                "price": service.service_price,
                "description": service.short_description or "",
            }
            for service in obj.services.all()
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if not data["image"] and instance.supplier and instance.supplier.logo:
            request = self.context.get("request")
            logo_url = instance.supplier.logo.url
            data["image"] = (
                request.build_absolute_uri(logo_url)
                if request
                else logo_url
            )

        return data

    class Meta:
        model = Product
        fields = (
            "id",
            "product_name",
            "product_type",
            "category",
            "category_name",
            "description",
            "image",
            "internal_images",
            "price",
            "stock_quantity",
            "minimum_quantity",
            "unit",
            "unit_name",
            "supplier",
            "supplier_name",
            "supplier_location",
            "supplier_status",
            "supplier_rating",
            "services",
            "service_details",
            "status",
            "shipping_cost",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
