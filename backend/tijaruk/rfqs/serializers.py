from rest_framework import serializers

from .models import RFQ


class RFQSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    product_name = serializers.CharField(source="product.product_name", read_only=True)
    product_type = serializers.CharField(source="product.product_type", read_only=True)
    category_name = serializers.CharField(source="product.category.category_name", read_only=True)
    product_description = serializers.CharField(source="product.description", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    supplier_id = serializers.IntegerField(source="product.supplier.id", read_only=True)
    supplier_name = serializers.CharField(source="product.supplier.supplier_name", read_only=True)
    supplier_full_name = serializers.CharField(source="product.supplier.full_name", read_only=True)
    supplier_location = serializers.CharField(source="product.supplier.location", read_only=True)
    supplier_status = serializers.CharField(source="product.supplier.supplier_status", read_only=True)
    supplier_email = serializers.EmailField(source="product.supplier.email", read_only=True)
    supplier_phone = serializers.CharField(source="product.supplier.phone", read_only=True)
    supplier_product_type = serializers.CharField(
        source="product.supplier.product_type.name",
        read_only=True,
    )
    supplier_description = serializers.CharField(
        source="product.supplier.supplier_description",
        read_only=True,
    )
    supplier_website = serializers.URLField(source="product.supplier.website", read_only=True)
    supplier_logo = serializers.ImageField(source="product.supplier.logo", read_only=True)
    supplier_payment_terms = serializers.CharField(
        source="product.supplier.payment_terms",
        read_only=True,
    )
    supplier_minimum_order_quantity = serializers.IntegerField(
        source="product.supplier.minimum_order_quantity",
        read_only=True,
    )
    supplier_joined_at = serializers.DateTimeField(
        source="product.supplier.user.date_joined",
        read_only=True,
    )
    supplier_rating = serializers.DecimalField(
        source="product.supplier.supplier_rating",
        max_digits=2,
        decimal_places=1,
        read_only=True,
    )
    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    product_shipping_cost = serializers.DecimalField(
        source="product.shipping_cost",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    product_stock_quantity = serializers.IntegerField(
        source="product.stock_quantity",
        read_only=True,
    )
    product_unit_name = serializers.CharField(
        source="product.unit.name",
        read_only=True,
    )
    preferred_country_name = serializers.CharField(
        source="preferred_country_of_origin.name",
        read_only=True,
    )
    additional_service_name = serializers.CharField(
        source="additional_service.service_name",
        read_only=True,
    )
    additional_service_price = serializers.DecimalField(
        source="additional_service.service_price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    business_phone = serializers.SerializerMethodField()
    business_location = serializers.SerializerMethodField()
    requester_user_id = serializers.CharField(source="created_by.user_id", read_only=True)
    requester_username = serializers.CharField(source="created_by.username", read_only=True)
    requester_full_name = serializers.CharField(source="created_by.full_name", read_only=True)
    requester_phone = serializers.CharField(source="created_by.phone", read_only=True)
    requester_role = serializers.CharField(source="created_by.role", read_only=True)
    requester_role_type = serializers.CharField(source="created_by.role_type", read_only=True)
    requester_is_active = serializers.BooleanField(source="created_by.is_active", read_only=True)
    requester_is_verified = serializers.BooleanField(source="created_by.is_verified", read_only=True)
    requester_photo = serializers.ImageField(source="created_by.photo", read_only=True)
    requester_date_joined = serializers.DateTimeField(source="created_by.date_joined", read_only=True)
    requester_updated_at = serializers.DateTimeField(source="created_by.updated_at", read_only=True)
    business_id = serializers.SerializerMethodField()
    business_email = serializers.SerializerMethodField()
    business_language = serializers.SerializerMethodField()
    business_created_at = serializers.SerializerMethodField()
    business_updated_at = serializers.SerializerMethodField()
    unit_name = serializers.CharField(source="unit.name", read_only=True)

    class Meta:
        model = RFQ
        fields = (
            "id",
            "rfq_id",
            "created_by",
            "created_by_email",
            "product",
            "product_name",
            "product_type",
            "category_name",
            "product_description",
            "product_image",
            "supplier_id",
            "supplier_name",
            "supplier_full_name",
            "supplier_location",
            "supplier_status",
            "supplier_email",
            "supplier_phone",
            "supplier_product_type",
            "supplier_description",
            "supplier_website",
            "supplier_logo",
            "supplier_payment_terms",
            "supplier_minimum_order_quantity",
            "supplier_joined_at",
            "supplier_rating",
            "product_price",
            "product_shipping_cost",
            "product_stock_quantity",
            "product_unit_name",
            "status",
            "quantity_required",
            "unit",
            "unit_name",
            "target_delivery_date",
            "preferred_country_of_origin",
            "preferred_country_name",
            "additional_service",
            "additional_service_name",
            "additional_service_price",
            "additional_details",
            "attachment",
            "business_phone",
            "business_location",
            "requester_user_id",
            "requester_username",
            "requester_full_name",
            "requester_phone",
            "requester_role",
            "requester_role_type",
            "requester_is_active",
            "requester_is_verified",
            "requester_photo",
            "requester_date_joined",
            "requester_updated_at",
            "business_id",
            "business_email",
            "business_language",
            "business_created_at",
            "business_updated_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "rfq_id",
            "created_by",
            "created_by_email",
            "status",
            "created_at",
            "updated_at",
        )

    def _business_profile(self, obj):
        return getattr(obj.created_by, "business_profile", None)

    def get_business_phone(self, obj):
        profile = self._business_profile(obj)
        return profile.user.phone if profile and profile.user else ""

    def get_business_location(self, obj):
        profile = self._business_profile(obj)
        return profile.location if profile else ""

    def get_business_id(self, obj):
        profile = self._business_profile(obj)
        return profile.id if profile else None

    def get_business_email(self, obj):
        profile = self._business_profile(obj)
        return profile.user.email if profile and profile.user else ""

    def get_business_language(self, obj):
        profile = self._business_profile(obj)
        return profile.language if profile else ""

    def get_business_created_at(self, obj):
        profile = self._business_profile(obj)
        return profile.created_at if profile else None

    def get_business_updated_at(self, obj):
        profile = self._business_profile(obj)
        return profile.updated_at if profile else None

    def validate_product(self, product):
        if product.is_archived:
            raise serializers.ValidationError("This product has been archived.")
        if product.supplier and product.supplier.user.is_archived:
            raise serializers.ValidationError(
                "This product belongs to an archived supplier."
            )
        return product

    def validate(self, attrs):
        attrs = super().validate(attrs)
        product = attrs.get("product") or getattr(self.instance, "product", None)
        quantity_required = attrs.get(
            "quantity_required",
            getattr(self.instance, "quantity_required", None),
        )

        if product and quantity_required is not None:
            minimum_quantity = product.minimum_quantity or 0
            if minimum_quantity and quantity_required < minimum_quantity:
                unit_name = getattr(product.unit, "name", "") or "units"
                raise serializers.ValidationError({
                    "quantity_required": (
                        f"Quantity must be greater than or equal to "
                        f"{minimum_quantity} {unit_name}."
                    )
                })

        return attrs


class RFQStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQ
        fields = ("status",)
