from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "sender_name", "content", "is_read", "created_at"]
        read_only_fields = ["id", "conversation", "sender", "sender_name", "is_read", "created_at"]

    def get_sender_name(self, obj):
        return obj.sender.full_name or obj.sender.email


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    business_user_email = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "business_user", "business_user_email",
            "title", "status", "last_message_at",
            "created_at", "updated_at", "messages",
        ]
        read_only_fields = ["id", "business_user", "business_user_email", "last_message_at", "created_at", "updated_at"]

    def get_business_user_email(self, obj):
        return obj.business_user.email


class ConversationListSerializer(serializers.ModelSerializer):
    business_user_email = serializers.SerializerMethodField()
    business_user_photo = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    support_unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "business_user", "business_user_email", "business_user_photo",
            "title", "status", "last_message_at",
            "created_at", "updated_at", "last_message_preview",
            "unread_count", "support_unread_count",
        ]

    def get_business_user_email(self, obj):
        return obj.business_user.email

    def get_business_user_photo(self, obj):
        if not obj.business_user.photo:
            return ""

        request = self.context.get("request")
        url = obj.business_user.photo.url
        return request.build_absolute_uri(url) if request else url

    def get_last_message_preview(self, obj):
        last = obj.messages.order_by("-created_at").first()
        return last.content[:100] if last else None

    def get_unread_count(self, obj):
        # Messages FROM the business user that haven't been read (admin inbox)
        return obj.messages.filter(is_read=False, sender=obj.business_user).count()

    def get_support_unread_count(self, obj):
        # Messages FROM support/admin that the business user hasn't read
        return obj.messages.filter(is_read=False).exclude(sender=obj.business_user).count()
