from rest_framework import serializers

from .models import UserNotification


class UserNotificationSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="notification.title", read_only=True)
    message = serializers.CharField(source="notification.message", read_only=True)
    notification_type = serializers.CharField(
        source="notification.notification_type",
        read_only=True,
    )

    class Meta:
        model = UserNotification
        fields = (
            "id",
            "title",
            "message",
            "notification_type",
            "is_read",
            "read_at",
            "created_at",
        )
        read_only_fields = fields
