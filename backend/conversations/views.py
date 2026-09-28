from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(generics.ListCreateAPIView):

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Conversation.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class ConversationDeleteView(generics.DestroyAPIView):

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Conversation.objects.filter(
            user=self.request.user
        )


class MessageListCreateView(generics.ListCreateAPIView):

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        conversation_id = self.kwargs[
            'conversation_id'
        ]

        return Message.objects.filter(
            conversation__id=conversation_id,
            conversation__user=self.request.user
        ).order_by('created_at')

    def perform_create(self, serializer):

        conversation_id = self.kwargs[
            'conversation_id'
        ]

        conversation = Conversation.objects.get(
            id=conversation_id,
            user=self.request.user
        )

        serializer.save(
            conversation=conversation
        )