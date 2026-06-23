from django.core.cache import cache

_TTL = 60  # seconds


def get_unread_count(user_id: int) -> int:
    key = f"notif_unread:{user_id}"
    val = cache.get(key)
    if val is None:
        from notifications.models import UserNotification
        val = UserNotification.objects.filter(user_id=user_id, is_read=False).count()
        cache.set(key, val, _TTL)
    return val


def invalidate_unread_count(user_id: int) -> None:
    cache.delete(f"notif_unread:{user_id}")
