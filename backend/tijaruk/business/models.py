from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
    
    
# Business
class Business(TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="business_profile",
        blank=True,
        null=True,
    )

    location = models.CharField(max_length=255)

    language = models.CharField(
        max_length=100,
        default="English (EN)",
        blank=True,
    )
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        if self.user_id:
            return self.user.email
        return str(self.pk)


class BusinessUserSettings(TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="business_settings",
    )
    two_factor_enabled = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    new_rfq_responses = models.BooleanField(default=True)
    order_status_updates = models.BooleanField(default=True)
