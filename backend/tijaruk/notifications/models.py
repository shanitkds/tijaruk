from django.db import models
from accounts.models import User

class Notification(models.Model):

    class NotificationType(models.TextChoices):
        INFO = "info", "Info"
        ALERT = "alert", "Alert"
        WARNING = "warning", "Warning"
        REMINDER = "reminder", "Reminder"

    class TargetRole(models.TextChoices):
        ALL = "all", "All Users"
        ADMIN = "admin", "Admin"
        INTERNAL_STAFF = "internal_staff", "Internal Staff"
        BUSINESS = "business", "Business User"

    title = models.CharField(max_length=255)
    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.INFO,
    )

    target_role = models.CharField(
        max_length=20,
        choices=TargetRole.choices,
        null=True,
        blank=True,
    )

    target_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="target_notifications",
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_notifications",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    
    
    
class UserNotification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name="user_notifications",
    )

    is_read = models.BooleanField(default=False)

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)