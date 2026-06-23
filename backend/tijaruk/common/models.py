from django.db import models
from django.core.exceptions import ValidationError


def validate_image_file(file):
    max_size = 5 * 1024 * 1024
    allowed_content_types = {"image/jpeg", "image/png", "image/webp"}

    if file.size > max_size:
        raise ValidationError("Image file size must be 5MB or less.")

    content_type = getattr(file.file, "content_type", None)
    if content_type and content_type not in allowed_content_types:
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed.")


class BasePersonInfo(models.Model):
    
    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"
        
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(
        max_length=20,
        choices=Gender.choices
    )
    location = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        abstract = True
