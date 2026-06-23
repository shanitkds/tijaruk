from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.mail import send_mail


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_notification_email_task(self, to_email: str, subject: str, body: str) -> None:
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task
def broadcast_ws_notification_task(
    user_id: int, title: str, message: str, notification_type: str = "info"
) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "notify",
            "title": title,
            "message": message,
            "notification_type": notification_type,
        },
    )


@shared_task
def cleanup_jwt_blacklist() -> None:
    from django.utils.timezone import now
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

    OutstandingToken.objects.filter(expires_at__lt=now()).delete()
