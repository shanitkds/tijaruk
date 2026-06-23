from django.urls import path

from .views import (
    NotificationListAPIView,
    NotificationReadAllAPIView,
    NotificationReadAPIView,
)


urlpatterns = [
    path("", NotificationListAPIView.as_view(), name="notification-list"),
    path("read-all/", NotificationReadAllAPIView.as_view(), name="notification-read-all"),
    path("<int:pk>/read/", NotificationReadAPIView.as_view(), name="notification-read"),
]
