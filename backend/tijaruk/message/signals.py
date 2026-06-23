from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User
from .models import Conversation


@receiver(post_save, sender=User)
def create_conversation_for_business_user(sender, instance, created, **kwargs):
    if created and instance.role == User.Role.BUSINESS:
        Conversation.objects.create(
            business_user=instance,
            title=instance.full_name or instance.email,
        )
