from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.views import APIView

from accounts.models import User
from accounts.models import PermissionModule
from superadmin.permissions import has_permission

from .models import Conversation
from .serializers import ConversationListSerializer, ConversationSerializer, MessageSerializer


def _get_role(user):
    return str(getattr(user, "role", "")).upper()


def _require_verified_business(user):
    """Raise 403 if a BUSINESS user is still a guest (role_type != USER)."""
    role_type = str(getattr(user, "role_type", "")).upper()
    if role_type != User.RoleType.USER:
        raise PermissionDenied("Guest users cannot access messaging. Please complete registration.")


def _is_admin_or_permitted_staff(user, action):
    return has_permission(user, PermissionModule.MESSAGES, action)


def _require_admin_or_permitted_staff(user, action):
    if not _is_admin_or_permitted_staff(user, action):
        raise PermissionDenied("You do not have permission to perform this action.")


class ConversationListCreateAPIView(APIView):
    """
    GET  /api/messages/conversations/
        - BUSINESS: own conversations only
        - ADMIN / permitted INTERNAL_STAFF: all conversations

    POST /api/messages/conversations/
        - BUSINESS: creates conversation for themselves
        - ADMIN / permitted INTERNAL_STAFF: must supply business_user id in body
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = _get_role(request.user)

        if role == "BUSINESS":
            _require_verified_business(request.user)
            qs = Conversation.objects.filter(business_user=request.user).order_by("-created_at")
        else:
            _require_admin_or_permitted_staff(request.user, "view")
            qs = Conversation.objects.all().order_by("-created_at")

        return Response(
            ConversationListSerializer(
                qs,
                many=True,
                context={"request": request},
            ).data
        )

    def post(self, request):
        role = _get_role(request.user)

        if role == "BUSINESS":
            _require_verified_business(request.user)
            business_user = request.user
        else:
            _require_admin_or_permitted_staff(request.user, "create")
            business_user_id = request.data.get("business_user")
            if not business_user_id:
                raise ValidationError({"business_user": "This field is required."})
            business_user = get_object_or_404(User, pk=business_user_id, role=User.Role.BUSINESS)

        serializer = ConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save(business_user=business_user)
        return Response(ConversationSerializer(conversation).data, status=HTTP_201_CREATED)


class ConversationDetailAPIView(APIView):
    """
    GET /api/messages/conversations/<pk>/
        - BUSINESS: own conversation only
        - ADMIN / permitted INTERNAL_STAFF: any conversation
    """
    permission_classes = [IsAuthenticated]

    def _get_conversation(self, user, action, pk):
        role = _get_role(user)
        if role == "BUSINESS":
            _require_verified_business(user)
            return get_object_or_404(Conversation, pk=pk, business_user=user)
        _require_admin_or_permitted_staff(user, action)
        return get_object_or_404(Conversation, pk=pk)

    def get(self, request, pk):
        conversation = self._get_conversation(request.user, "view", pk)
        return Response(ConversationSerializer(conversation).data)


class MessageListCreateAPIView(APIView):
    """
    GET  /api/messages/conversations/<pk>/messages/
        - BUSINESS: messages in own conversations only
        - ADMIN / permitted INTERNAL_STAFF: messages in any conversation

    POST /api/messages/conversations/<pk>/messages/
        - BUSINESS: can send in own conversations only
        - ADMIN / permitted INTERNAL_STAFF: can send in any conversation
    """
    permission_classes = [IsAuthenticated]

    def _get_conversation(self, user, action, pk):
        role = _get_role(user)
        if role == "BUSINESS":
            _require_verified_business(user)
            return get_object_or_404(Conversation, pk=pk, business_user=user)
        _require_admin_or_permitted_staff(user, action)
        return get_object_or_404(Conversation, pk=pk)

    def get(self, request, pk):
        conversation = self._get_conversation(request.user, "view", pk)
        messages = conversation.messages.select_related("sender").order_by("created_at")
        # Mark all unread messages sent by others as read
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, pk):
        conversation = self._get_conversation(request.user, "create", pk)
        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(conversation=conversation, sender=request.user)
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=["last_message_at"])
        return Response(MessageSerializer(message).data, status=HTTP_201_CREATED)


class ConversationMarkReadAPIView(APIView):
    """
    POST /api/messages/conversations/<pk>/read/
    Marks all messages in the conversation sent by others (not the requester) as is_read=True.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        role = _get_role(request.user)
        if role == "BUSINESS":
            _require_verified_business(request.user)
            conversation = get_object_or_404(Conversation, pk=pk, business_user=request.user)
        else:
            _require_admin_or_permitted_staff(request.user, "view")
            conversation = get_object_or_404(Conversation, pk=pk)

        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({"status": "ok"})
