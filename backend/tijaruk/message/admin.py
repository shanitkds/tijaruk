from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ["sender", "content", "is_read", "created_at"]


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "business_user", "title", "status", "last_message_at", "created_at"]
    list_filter = ["status"]
    search_fields = ["title", "business_user__email", "business_user__full_name"]
    readonly_fields = ["last_message_at", "created_at", "updated_at"]
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "sender", "is_read", "created_at"]
    list_filter = ["is_read"]
    search_fields = ["content", "sender__email", "sender__full_name"]
    readonly_fields = ["created_at"]
