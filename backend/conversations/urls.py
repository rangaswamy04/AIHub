from django.urls import path

from .views import (
    ConversationListCreateView,
    ConversationDeleteView,
    MessageListCreateView,
)


urlpatterns = [

    path(
        '',
        ConversationListCreateView.as_view(),
        name='conversation-list-create'
    ),

    path(
        '<int:pk>/delete/',
        ConversationDeleteView.as_view(),
        name='conversation-delete'
    ),

    path(
        '<int:conversation_id>/messages/',
        MessageListCreateView.as_view(),
        name='message-list-create'
    ),

]