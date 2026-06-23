from django.core.cache import cache

_PERM_TTL = 60 * 5  # 5 minutes


def get_cached_permission(user_id: int, module: str) -> bool | None:
    return cache.get(f"perm:{user_id}:{module}")


def set_cached_permission(user_id: int, module: str, value: bool) -> None:
    cache.set(f"perm:{user_id}:{module}", value, _PERM_TTL)


def invalidate_user_permissions(user_id: int) -> None:
    from superadmin.models import PermissionModule
    keys = [f"perm:{user_id}:{m}" for m in PermissionModule.values]
    cache.delete_many(keys)
