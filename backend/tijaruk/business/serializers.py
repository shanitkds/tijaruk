from django.db import transaction
from rest_framework import serializers
from django.core.validators import RegexValidator
from accounts.models import User
from .models import Business, BusinessUserSettings


class BusinessUserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessUserSettings
        fields = (
            "two_factor_enabled",
            "email_notifications",
            "new_rfq_responses",
            "order_status_updates",
        )


class BusinessSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
    )
    user_id = serializers.CharField(source="user.user_id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_photo = serializers.SerializerMethodField()
    email = serializers.EmailField(required=True, write_only=True)

    # Validation for phone number
    phone = serializers.CharField(
        required=True,
        write_only=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )

    class Meta:
        model = Business
        fields = [
            'id', 'password', 'user_id', 'user_email', 'user_photo',
            'location', 'email', 'phone', 'language',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')

    def get_user_photo(self, obj):
        if not obj.user or not obj.user.photo:
            return ""

        request = self.context.get("request")
        url = obj.user.photo.url
        return request.build_absolute_uri(url) if request else url

    def validate(self, attrs):
        password = attrs.pop("password", None)
        existing_user = self.context.get("existing_user")
        if self.instance is None and not existing_user:
            if not password:
                raise serializers.ValidationError(
                    {"password": "This field is required."}
                )
            attrs["password"] = password

        email = attrs.get("email")
        if email:
            users = User.objects.filter(email__iexact=email)
            if self.instance and self.instance.user_id:
                users = users.exclude(pk=self.instance.user_id)
            existing_user = self.context.get("existing_user_obj")
            if existing_user is not None:
                users = users.exclude(pk=existing_user.pk)
            if users.exists():
                raise serializers.ValidationError(
                    {"email": "A user with this email already exists."}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = validated_data.pop("user", None)
        email = validated_data.pop("email")
        phone = validated_data.pop("phone")
        if user is not None:
            user.email = email
            user.username = email
            user.phone = phone
            user.save(update_fields=["email", "username", "phone", "updated_at"])
            return Business.objects.create(user=user, **validated_data)

        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=email,
            username=email,
            password=password,
            role=User.Role.BUSINESS,
            full_name=email,
            phone=phone,
        )
        return Business.objects.create(user=user, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        email = validated_data.pop("email", None)
        phone = validated_data.pop("phone", None)
        business = super().update(instance, validated_data)
        user_fields = []
        if business.user:
            if email is not None:
                business.user.email = email
                business.user.username = email
                user_fields.extend(["email", "username"])
            if phone is not None:
                business.user.phone = phone
                user_fields.append("phone")
            if user_fields:
                business.user.save(update_fields=[*user_fields, "updated_at"])
        return business

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["email"] = instance.user.email if instance.user else ""
        representation["phone"] = instance.user.phone if instance.user else ""
        return representation


class BusinessUserProfileSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=False)
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(
        max_length=20,
        required=False,
        validators=[
            RegexValidator(
                regex=r"^\+?[\d\s().-]{9,25}$",
                message="Enter a valid phone number with 9 to 15 digits.",
            )
        ],
    )
    photo = serializers.ImageField(required=False, allow_null=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    language = serializers.CharField(max_length=100, required=False)

    required_business_fields = (
        "location",
    )

    def clean_phone_number(self, value):
        if not value:
            return value
        value = value.strip()
        prefix = "+" if value.startswith("+") else ""
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 9 or len(digits) > 15:
            raise serializers.ValidationError(
                "Enter a valid phone number with 9 to 15 digits."
            )
        return f"{prefix}{digits}"

    def validate_username(self, value):
        user = self.instance
        value = value.strip()
        if User.objects.exclude(pk=user.pk).filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return User.objects.normalize_email(value)

    def validate_phone(self, value):
        return self.clean_phone_number(value)

    @transaction.atomic
    def update(self, user, validated_data):
        business = getattr(user, "business_profile", None)
        user_fields = []
        business_fields = []

        if business is None and any(
            field in validated_data
            for field in self.required_business_fields
        ):
            missing_fields = [
                field
                for field in self.required_business_fields
                if not validated_data.get(field)
            ]
            if missing_fields:
                raise serializers.ValidationError(
                    {
                        field: "This field is required to create your business profile."
                        for field in missing_fields
                    }
                )

        if "full_name" in validated_data:
            user.full_name = validated_data["full_name"].strip()
            user_fields.append("full_name")
        if "username" in validated_data:
            user.username = validated_data["username"]
            user_fields.append("username")
        if "email" in validated_data:
            user.email = validated_data["email"]
            user_fields.append("email")
        if "phone" in validated_data:
            user.phone = validated_data["phone"]
            user_fields.append("phone")
        if "photo" in validated_data:
            user.photo = validated_data["photo"]
            user_fields.append("photo")

        if business is None and any(
            field in validated_data
            for field in self.required_business_fields
        ):
            business = Business.objects.create(
                user=user,
                location=validated_data["location"],
                language=validated_data.get("language", "English (EN)"),
            )
        elif business is not None:
            for field in (
                "location",
                "language",
            ):
                if field in validated_data:
                    setattr(business, field, validated_data[field])
                    business_fields.append(field)

        if user_fields:
            user.save(update_fields=[*user_fields, "updated_at"])
        if business_fields:
            business.save(update_fields=[*business_fields, "updated_at"])
        return user

    def to_representation(self, user):
        request = self.context.get("request")
        business = getattr(user, "business_profile", None)
        rfqs = user.rfqs.filter(is_archived=False)
        total_rfqs = rfqs.count()
        completed = rfqs.filter(status="APPROVED").count()
        in_progress = rfqs.filter(status="PENDING").count()

        avatar = ""
        if user.photo:
            avatar = user.photo.url
            if request:
                avatar = request.build_absolute_uri(avatar)

        location = business.location if business else ""
        return {
            "user": {
                "name": user.full_name or user.username,
                "username": user.username,
                "role": user.role,
                "company": "",
                "email": user.email,
                "phone": user.phone,
                "location": location,
                "language": business.language if business else "",
                "memberSince": user.date_joined.strftime("%b %Y"),
                "completedRfqs": completed,
                "avatar": avatar,
            },
            "company": {
                "location": location,
                "memberSince": (
                    business.created_at.strftime("%b %Y") if business else ""
                ),
                "totalRfqs": total_rfqs,
                "completed": completed,
                "inProgress": in_progress,
            },
            "profileComplete": business is not None,
        }
