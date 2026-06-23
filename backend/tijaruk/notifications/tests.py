from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User

from .models import Notification, UserNotification


class NotificationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="business@example.com",
            username="business",
            password="password",
            role=User.Role.BUSINESS,
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="password",
            role=User.Role.BUSINESS,
        )
        notification = Notification.objects.create(
            title="Test notification",
            message="Test message",
        )
        self.user_notification = UserNotification.objects.create(
            user=self.user,
            notification=notification,
        )
        UserNotification.objects.create(
            user=self.other_user,
            notification=notification,
        )

    def test_user_can_list_and_mark_only_own_notifications_as_read(self):
        self.client.force_authenticate(self.user)

        list_response = self.client.get("/api/notifications/")
        read_response = self.client.patch(
            f"/api/notifications/{self.user_notification.pk}/read/",
            {},
            format="json",
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(read_response.status_code, 200)
        self.assertTrue(read_response.data["is_read"])
        self.assertIsNotNone(read_response.data["read_at"])

    def test_user_cannot_mark_another_users_notification_as_read(self):
        other_notification = UserNotification.objects.get(user=self.other_user)
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            f"/api/notifications/{other_notification.pk}/read/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_user_can_mark_all_own_notifications_as_read(self):
        second_notification = Notification.objects.create(
            title="Second notification",
            message="Second message",
        )
        UserNotification.objects.create(
            user=self.user,
            notification=second_notification,
        )
        other_notification = UserNotification.objects.get(user=self.other_user)
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            "/api/notifications/read-all/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["updated_count"], 2)
        self.assertFalse(
            UserNotification.objects.filter(user=self.user, is_read=False).exists()
        )
        other_notification.refresh_from_db()
        self.assertFalse(other_notification.is_read)
        self.assertIsNone(other_notification.read_at)
