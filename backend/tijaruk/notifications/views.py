from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .cache import invalidate_unread_count
from .models import UserNotification
from .serializers import UserNotificationSerializer


class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = UserNotification.objects.filter(
            user=request.user,
        ).select_related("notification").order_by("-created_at")
        return Response(UserNotificationSerializer(notifications, many=True).data)


class NotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user_notification = get_object_or_404(
            UserNotification,
            pk=pk,
            user=request.user,
        )
        if not user_notification.is_read:
            user_notification.is_read = True
            user_notification.read_at = timezone.now()
            user_notification.save(update_fields=["is_read", "read_at"])
            invalidate_unread_count(request.user.pk)

        return Response(UserNotificationSerializer(user_notification).data)


class NotificationReadAllAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated_count = UserNotification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(
            is_read=True,
            read_at=timezone.now(),
        )
        if updated_count:
            invalidate_unread_count(request.user.pk)

        return Response({"updated_count": updated_count})
