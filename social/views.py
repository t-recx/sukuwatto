from rest_framework.decorators import api_view
from django.db.models import Q
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from social.models import Message, LastMessage, Post
from social.serializers import MessageSerializer, MessageReadSerializer, LastMessageSerializer, PostSerializer
from rest_framework import viewsets
from rest_framework import generics, status, mixins
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.contrib.auth import get_user_model
from pprint import pprint
from social.message_service import MessageService
from sqtrex.pagination import StandardResultsSetPagination

class PostViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user__username']
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

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
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        user = None
        if request and hasattr(request, "user"):
            user = request.user

        with_user = request.query_params.get('with_user', None)

        queryset = Message.objects.filter(Q(from_user=user)| Q(to_user=user))

        if with_user is not None:
            queryset = queryset.filter(Q(from_user__id=with_user) | Q(to_user__id=with_user))

        page = self.paginate_queryset(queryset.order_by('-date'))

        if page is not None:
            page = sorted(page, key=lambda x: x.date)

            serializer = MessageReadSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        queryset = queryset.order_by('date')

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
        
        message_service = MessageService()

        message_service.update_read(user_id, correspondent_id)

        return Response(status=status.HTTP_204_NO_CONTENT)