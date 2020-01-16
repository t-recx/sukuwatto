from rest_framework.decorators import api_view
from django.db.models import Q
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from social.models import Message, LastMessage
from social.serializers import MessageSerializer, MessageReadSerializer, LastMessageSerializer
from rest_framework import viewsets
from rest_framework import generics, status, mixins
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.contrib.auth import get_user_model
from pprint import pprint

class LastMessageList(generics.ListAPIView):
    queryset = LastMessage.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = LastMessageSerializer

    def list(self, request):
        user = None
        if request and hasattr(request, "user"):
            user = request.user

        queryset = LastMessage.objects.filter(user=user)

        serializer = LastMessageSerializer(queryset, many=True)

        return Response(serializer.data)

class MessageList(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = None
        if request and hasattr(request, "user"):
            user = request.user

        with_user = request.query_params.get('with_user', None)

        queryset = Message.objects.filter(Q(from_user=user)| Q(to_user=user))

        if with_user is not None:
            queryset = queryset.filter(Q(from_user__id=with_user) | Q(to_user__id=with_user))

        serializer = MessageReadSerializer(queryset, many=True)

        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        headers = self.get_success_headers(serializer.data)
        read_serializer = MessageReadSerializer(instance=instance)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_serializer_class(self):
        if self.request.method in ['GET']:
            return MessageReadSerializer

        return MessageSerializer

@api_view(['POST'])
def update_last_message(request):
    if request.method == 'POST':
        user_id = request.data.get('user', None)
        correspondent_id = request.data.get('correspondent', None)
        
        objs = LastMessage.objects.filter(user__id=user_id, correspondent__id=correspondent_id)

        if len(objs) == 1:
            obj = objs[0]
            obj.unread_count = 0;
            obj.last_message_read = obj.last_message 
            obj.save()

        return Response(status=status.HTTP_204_NO_CONTENT)