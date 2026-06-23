from django.db.models import Q

from accounts.models import User
from accounts.models import PermissionModule

from .cache import invalidate_unread_count
from .models import Notification, UserNotification


def _active_users(users):
    return users.filter(is_active=True, is_archived=False).distinct()


def create_notification(
    *,
    recipients,
    title,
    message,
    created_by=None,
    notification_type=Notification.NotificationType.INFO,
    target_role=None,
    target_user=None,
    preference_field=None,
):
    recipient_users = list(
        _active_users(recipients).select_related("business_settings")
    )
    if preference_field:
        recipient_users = [
            user
            for user in recipient_users
            if user.role != User.Role.BUSINESS
            or getattr(
                getattr(user, "business_settings", None),
                preference_field,
                True,
            )
        ]
    if not recipient_users:
        return None

    notification = Notification.objects.create(
        title=title,
        message=message,
        notification_type=notification_type,
        target_role=target_role,
        target_user=target_user,
        created_by=created_by,
    )
    UserNotification.objects.bulk_create(
        [
            UserNotification(user=user, notification=notification)
            for user in recipient_users
        ]
    )

    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            for user in recipient_users:
                async_to_sync(channel_layer.group_send)(
                    f"user_{user.id}",
                    {
                        "type": "notify",
                        "title": notification.title,
                        "message": notification.message,
                    },
                )
    except Exception:
        pass

    for user in recipient_users:
        invalidate_unread_count(user.pk)
        business_preferences = getattr(user, "business_settings", None)
        if user.role == User.Role.BUSINESS and getattr(
            business_preferences, "email_notifications", True
        ):
            from .tasks import send_notification_email_task
            send_notification_email_task.delay(
                user.email,
                f"Tijaruk: {title}",
                message,
            )
    return notification


def notify_businesses_of_new_product(product, created_by):
    recipients = User.objects.filter(role=User.Role.BUSINESS)
    return create_notification(
        recipients=recipients,
        title="New product available",
        message=f'A new product, "{product.product_name}", has been created.',
        created_by=created_by,
        target_role=Notification.TargetRole.BUSINESS,
    )


def notify_rfq_submitted(rfq, submitted_by):
    create_notification(
        recipients=User.objects.filter(pk=submitted_by.pk),
        title="RFQ submitted",
        message=f"Your RFQ {rfq.rfq_id} was submitted successfully.",
        created_by=submitted_by,
        target_user=submitted_by,
    )

    recipients = User.objects.filter(
        Q(role=User.Role.ADMIN)
        | Q(
            role=User.Role.INTERNAL_STAFF,
            staff_profile__role_obj__role_status=True,
            staff_profile__role_obj__permissions__module=PermissionModule.RFQS,
        )
        & (
            Q(staff_profile__role_obj__permissions__full_access=True)
            | Q(staff_profile__role_obj__permissions__can_view=True)
            | Q(staff_profile__role_obj__permissions__can_edit=True)
        )
    )
    return create_notification(
        recipients=recipients,
        title="New RFQ submitted",
        message=f"RFQ {rfq.rfq_id} was submitted by {submitted_by.email}.",
        created_by=submitted_by,
        notification_type=Notification.NotificationType.ALERT,
    )


def notify_rfq_status_changed(rfq, changed_by):
    status_label = rfq.get_status_display().lower()
    notification_type = (
        Notification.NotificationType.INFO
        if rfq.status == rfq.Status.APPROVED
        else Notification.NotificationType.WARNING
    )
    return create_notification(
        recipients=User.objects.filter(pk=rfq.created_by_id),
        title=f"RFQ {status_label}",
        message=f"Your RFQ {rfq.rfq_id} has been {status_label}.",
        created_by=changed_by,
        target_user=rfq.created_by,
        notification_type=notification_type,
        preference_field="new_rfq_responses",
    )
