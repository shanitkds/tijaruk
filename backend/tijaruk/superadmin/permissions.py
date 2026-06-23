from rest_framework.permissions import BasePermission

from superadmin.cache import get_cached_permission, set_cached_permission


def _get_role(user):
    role = getattr(user, "role", "")
    return str(role).upper() if role else ""


def has_permission(user, module, action):
    if not user or not getattr(user, "is_authenticated", False):
        return False

    role = _get_role(user)

    if user.is_superuser or role == "ADMIN":
        return True

    if role != "INTERNAL_STAFF":
        return False

    cache_key = f"{module}:{action}"
    cached = get_cached_permission(user.pk, cache_key)
    if cached is not None:
        return cached

    role_obj = getattr(user, "role_obj", None)
    if not role_obj:
        set_cached_permission(user.pk, cache_key, False)
        return False

    perm = role_obj.permissions.filter(module=module).first()

    if not perm:
        set_cached_permission(user.pk, cache_key, False)
        return False

    if perm.full_access:
        set_cached_permission(user.pk, cache_key, True)
        return True

    permission_field = f"can_{action}"
    if not hasattr(perm, permission_field):
        set_cached_permission(user.pk, cache_key, False)
        return False

    result = getattr(perm, permission_field, False)
    set_cached_permission(user.pk, cache_key, result)
    return result


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False

        return bool(getattr(user, "is_superuser", False) or _get_role(user) == "ADMIN")


class IsInternalStaffRole(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False

        return _get_role(user) == "INTERNAL_STAFF"
