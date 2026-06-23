from django.db import transaction
from rest_framework import serializers

from accounts.models import User

from .models import ProductType, Supplier


class SupplierSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
    )
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_id = serializers.CharField(source="user.user_id", read_only=True)
    user_date_joined = serializers.DateTimeField(
        source="user.date_joined",
        read_only=True,
    )
    product_type_name = serializers.CharField(
        source="product_type.name",
        read_only=True,
    )

    def validate_user(self, user):
        if user.role != User.Role.SUPPLIER:
            raise serializers.ValidationError(
                "The selected user must have the SUPPLIER role."
            )
        return user

    def validate(self, attrs):
        if self.instance:
            attrs.pop("password", None)
            return attrs

        if not self.instance and not attrs.get("user"):
            if not attrs.get("password"):
                raise serializers.ValidationError(
                    {"password": "This field is required."}
                )

            email = attrs.get("email")
            if email and User.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError(
                    {"email": "A user with this email already exists."}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = validated_data.get("user")

        if user is None:
            email = validated_data["email"]
            user = User.objects.create_user(
                email=email,
                username=email,
                password=password,
                role=User.Role.SUPPLIER,
            )
            validated_data["user"] = user

        return super().create(validated_data)

    class Meta:
        model = Supplier
        fields = (
            "id",
            "user",
            "password",
            "user_email",
            "user_id",
            "user_date_joined",
            "full_name",
            "date_of_birth",
            "gender",
            "location",
            "phone",
            "supplier_name",
            "product_type",
            "product_type_name",
            "supplier_description",
            "email",
            "website",
            "supplier_status",
            "supplier_rating",
            "logo",
            "payment_terms",
            "minimum_order_quantity",
        )
        read_only_fields = ("id",)
        extra_kwargs = {
            "user": {"required": False},
        }


class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ("id", "name")
