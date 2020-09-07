from rest_framework.decorators import api_view, permission_classes
from social.utils import get_user_actions_filtered_by_object
from django.db.models import Q
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from social.models import Message, LastMessage, Post, Comment, UserAction
from social.serializers import MessageSerializer, MessageReadSerializer, LastMessageSerializer, PostSerializer, CommentSerializer
from rest_framework import viewsets
from rest_framework import generics, status, mixins
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.contrib.auth import get_user_model
from pprint import pprint
from social.message_service import MessageService
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.serializers import ActionSerializer
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from sqtrex.permissions import StandardPermissionsMixin
from workouts.models import Workout, Plan, Exercise

class ActionObjectStreamList(generics.ListAPIView):
    def list(self, request):
        content_type_id = request.query_params.get('content_type_id', None)
        object_id = request.query_params.get('object_id', None)

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        object_model = ctype.model

        queryset = get_user_actions_filtered_by_object(UserAction.objects.all(), content_type_id, object_id, False)

        queryset = queryset.order_by('-timestamp')

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class TargetStreamList(generics.ListAPIView):
    def list(self, request):
        content_type_id = request.query_params.get('content_type_id', None)
        object_id = request.query_params.get('object_id', None)
        verb = request.query_params.get('verb', None)

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        object_model = ctype.model

        queryset = get_user_actions_filtered_by_object(UserAction.objects.all(), content_type_id, object_id, True)

        if verb is not None:
            queryset = queryset.filter(verb=verb)

        queryset = queryset.order_by('-timestamp')

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

    return Response(user_liked_object(request.user, content_type_id, object_id))

def user_liked_object(user, content_type_id, object_id):
    return get_queryset_like(user, content_type_id, object_id).exists()

def get_queryset_like(user, content_type_id, object_id):
    return get_user_actions_filtered_by_object(UserAction.objects.filter(Q(user=user), Q(verb='liked')), content_type_id, object_id, True)

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

    ctype = get_object_or_404(ContentType, pk=content_type_id)

    queryset = get_queryset_like(user, content_type_id, object_id)

    deleted = False

    if queryset.exists():
        queryset.delete()
        deleted = True

    object_model = ctype.model

    model = None

    target_workout = None
    target_plan = None
    target_post = None
    target_exercise = None

    if object_model == 'workout':
        model = Workout.objects.get(pk=object_id)
        target_workout = model
    elif object_model == 'plan':
        model = Plan.objects.get(pk=object_id)
        target_plan = model
    elif object_model == 'post':
        model = Post.objects.get(pk=object_id)
        target_post = model
    elif object_model == 'exercise':
        model = Exercise.objects.get(pk=object_id)
        target_exercise = model

    if not deleted:
        UserAction.objects.create(user=request.user, verb='liked', target_workout=target_workout, target_plan=target_plan,
            target_post=target_post, target_exercise=target_exercise)

    if model is not None:
        if deleted:
            model.likes -= 1
        else:
            model.likes += 1

        if model.likes < 0:
            model.likes = 0

        model.save()

    return Response(status=status.HTTP_204_NO_CONTENT)