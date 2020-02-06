from rest_framework.decorators import api_view
from django.db.models import Q
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from social.models import Message, LastMessage, Post, Comment
from social.serializers import MessageSerializer, MessageReadSerializer, LastMessageSerializer, PostSerializer, CommentSerializer
from rest_framework import viewsets
from rest_framework import generics, status, mixins
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.contrib.auth import get_user_model
from pprint import pprint
from social.message_service import MessageService
from sqtrex.pagination import StandardResultsSetPagination
from actstream.models import action_object_stream, Action, target_stream
from sqtrex.serializers import ActionSerializer
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from actstream import action

class ActionObjectStreamList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        content_type_id = request.query_params.get('content_type_id', None)
        object_id = request.query_params.get('object_id', None)

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        queryset = action_object_stream(instance)

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class TargetStreamList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        content_type_id = request.query_params.get('content_type_id', None)
        object_id = request.query_params.get('object_id', None)

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        queryset = target_stream(instance)

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user__username']
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

class CommentViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
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

@api_view(['POST'])
def toggle_like(request):
    user = request.user
    content_type_id = request.data.get('content_type_id', None)
    object_id = request.data.get('object_id', None)
    user_content_type_id = ContentType.objects.get(app_label='users', model='customuser').pk

    actor_ctype = get_object_or_404(ContentType, pk=user_content_type_id)
    ctype = get_object_or_404(ContentType, pk=content_type_id)
    instance = get_object_or_404(ctype.model_class(), pk=object_id)

    queryset = Action.objects.filter(actor_content_type=actor_ctype, actor_object_id=user.id,
        target_content_type=ctype, target_object_id=object_id, verb='liked')

    if queryset.count() > 0:
        queryset.delete()
    else:
        action.send(request.user, verb='liked', target=instance)

    return Response(status=status.HTTP_204_NO_CONTENT)
