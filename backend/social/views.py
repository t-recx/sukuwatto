from rest_framework.decorators import api_view, permission_classes
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
from sqtrex.permissions import StandardPermissionsMixin
from workouts.models import Workout, Plan, Exercise

class ActionObjectStreamList(generics.ListAPIView):
    def list(self, request):
        content_type_id = request.query_params.get('content_type_id', None)
        object_id = request.query_params.get('object_id', None)

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        queryset = action_object_stream(instance)

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class TargetStreamList(generics.ListAPIView):
    def list(self, request):
        content_type_id = request.query_params.get('content_type_id', None)
        object_id = request.query_params.get('object_id', None)

        verb = request.query_params.get('verb', None)
        actor_content_type_id = request.query_params.get('actor_content_type_id', None)
        actor_object_id = request.query_params.get('actor_object_id', None)

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        queryset = target_stream(instance)

        if verb is not None:
            queryset = queryset.filter(verb=verb)

        if actor_content_type_id is not None:
            queryset = queryset.filter(actor_content_type_id=actor_content_type_id)

        if actor_object_id is not None:
            queryset = queryset.filter(actor_object_id=actor_object_id)

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class PostViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user__username']
    pagination_class = StandardResultsSetPagination

class CommentViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
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

class MessageList(generics.ListAPIView):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    serializer_class = MessageReadSerializer

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_liked(request):
    content_type_id = request.query_params.get('content_type_id', None)
    object_id = request.query_params.get('object_id', None)

    verb = request.query_params.get('verb', None)
    actor_content_type_id = request.query_params.get('actor_content_type_id', None)
    actor_object_id = request.query_params.get('actor_object_id', None)

    ctype = get_object_or_404(ContentType, pk=content_type_id)
    instance = get_object_or_404(ctype.model_class(), pk=object_id)

    queryset = target_stream(instance)

    if verb is not None:
        queryset = queryset.filter(verb=verb)

    if actor_content_type_id is not None:
        queryset = queryset.filter(actor_content_type_id=actor_content_type_id)

    if actor_object_id is not None:
        queryset = queryset.filter(actor_object_id=actor_object_id)

    return Response(queryset.exists())


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_last_message(request):
    if request.method == 'POST':
        user_id = request.user.id
        correspondent_id = request.data.get('correspondent', None)
        
        message_service = MessageService()

        message_service.update_read(user_id, correspondent_id)

        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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

    deleted = False

    if queryset.count() > 0:
        queryset.delete()
        deleted = True
    else:
        action.send(request.user, verb='liked', target=instance)

    object_model = ctype.model

    model = None

    if object_model == 'workout':
        model = Workout.objects.get(pk=object_id)
    elif object_model == 'plan':
        model = Plan.objects.get(pk=object_id)
    elif object_model == 'post':
        model = Post.objects.get(pk=object_id)
    elif object_model == 'exercise':
        model = Exercise.objects.get(pk=object_id)

    if model is not None:
        if deleted:
            model.likes -= 1
        else:
            model.likes += 1

        if model.likes < 0:
            model.likes = 0

        model.save()

    return Response(status=status.HTTP_204_NO_CONTENT)