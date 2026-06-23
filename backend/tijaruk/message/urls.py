from django.urls import path
from .views import ConversationDetailAPIView, ConversationListCreateAPIView, ConversationMarkReadAPIView, MessageListCreateAPIView

urlpatterns = [
    path("conversations/", ConversationListCreateAPIView.as_view(), name="conversation-list-create"),
    path("conversations/<int:pk>/", ConversationDetailAPIView.as_view(), name="conversation-detail"),
    path("conversations/<int:pk>/messages/", MessageListCreateAPIView.as_view(), name="message-list-create"),
    path("conversations/<int:pk>/read/", ConversationMarkReadAPIView.as_view(), name="conversation-mark-read"),
]
