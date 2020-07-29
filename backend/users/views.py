from sqtrex.pagination import StandardResultsSetPagination
from actstream.models import Follow, followers, following
from actstream.actions import follow, unfollow
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser
from .serializers import UserSerializer, GroupSerializer, FileSerializer, ExpressInterestSerializer
from sqtrex.serializers import ActionSerializer
from django.shortcuts import get_object_or_404
from actstream import models
from sqtrex.permissions import IsUserOrReadOnly
from users.models import CustomUser, UserInterest
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from sqtrex.visibility import Visibility
from django.db.models import Q
from django.utils.safestring import mark_safe
from sqtrex.visibility import VisibilityQuerysetMixin
from workouts.models import Workout
import json

class FollowersList(generics.ListAPIView):
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        queryset = followers(user)

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = UserSerializer(queryset, many=True)

        return Response(serializer.data)

class FollowingList(generics.ListAPIView):
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        queryset = following(user, get_user_model())

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = UserSerializer(queryset, many=True)

        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    pagination_class = StandardResultsSetPagination
    queryset = get_user_model().objects.order_by('username').all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['username', 'email']

    def perform_create(self, serializer):
        instance = serializer.save()

        instance.set_password(instance.password)
        
        instance.save()

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action == 'list' or self.action == 'retrieve':
            permission_classes = [AllowAny]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsUserOrReadOnly]
        elif self.action == 'destroy':
            permission_classes = [IsUserOrReadOnly]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]

class FileUploadView(APIView):
    parser_class = (FileUploadParser,)

    def post(self, request, *args, **kwargs):
        file_serializer = FileSerializer(data=request.data)

        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)

        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_permissions(self):
        permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

class StreamList(generics.ListAPIView):
    pagination_class = StandardResultsSetPagination

    def get_stream_queryset(self, request):
        pass

    def get_queryset_visibility(self, queryset, user):
        #print(mark_safe(json.dumps(list(queryset.values()), default=str, ensure_ascii=False)))
        user_ctype_id = ContentType.objects.get(model='customuser').id
        workout_ctype_id = ContentType.objects.get(model='workout').id

        queryset_target_workouts = queryset.filter(Q(target_content_type_id=workout_ctype_id))
        queryset_action_object_workouts = queryset.filter(Q(action_object_content_type_id=workout_ctype_id))

        target_workout_ids = [int(oid) for oid in queryset_target_workouts.order_by('target_object_id').values_list('target_object_id', flat=True).distinct()]
        action_object_workout_ids = [int(oid) for oid in queryset_action_object_workouts.order_by('action_object_object_id').values_list('action_object_object_id', flat=True).distinct()]

        combined_list = target_workout_ids + list(set(action_object_workout_ids) - set(target_workout_ids))

        visibility = VisibilityQuerysetMixin()

        queryset_workouts = visibility.get_queryset_visibility(Workout.objects.filter(id__in=combined_list), user)

        workout_visible_ids = [workout.id for workout in queryset_workouts]

        queryset = queryset.exclude(Q(target_content_type_id=workout_ctype_id),~Q(target_object_id__in=workout_visible_ids))
        queryset = queryset.exclude(Q(action_object_content_type_id=workout_ctype_id),~Q(action_object_object_id__in=workout_visible_ids))

        return queryset

    def list(self, request):
        queryset = self.get_stream_queryset(request)

        queryset = self.get_queryset_visibility(queryset, request.user)

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = ActionSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class UserStreamList(StreamList):
    permission_classes = [IsAuthenticated]

    def get_stream_queryset(self, request):
        return models.user_stream(request.user, with_user_activity=True)

class ActorStreamList(StreamList):
    def get_stream_queryset(self, request):
        user = None

        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        return models.actor_stream(user)

class ExpressInterestCreate(generics.CreateAPIView):
    serializer_class = ExpressInterestSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_is_following(request):
    if request.method == 'GET':
        user = None
        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        return Response(Follow.objects.is_following(request.user, user))

@api_view(['POST'])
def express_interest(request):
    email = request.data.get('email', None)

    if email is None or len(email.strip()) == 0:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    UserInterest.objects.create(email=email)

    return Response(status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def do_follow(request):
    if request.method == 'POST':
        content_type_id = request.data.get('content_type_id', None)
        object_id = request.data.get('object_id', None)
        flag = request.data.get('flag', '')

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        follow(request.user, instance, actor_only=True, flag=flag)
        return Response(status=status.HTTP_201_CREATED)

@api_view(['POST'])
def validate_password(request):
    errors = list()

    try:
        password_validation.validate_password(password=request.data.get('password'), user=get_user_model()(**request.data))
    except ValidationError as e:
        errors = list(e.messages)

    return Response(errors)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password', None)
    new_password = request.data.get('new_password', None)

    if not request.user.check_password(old_password):
        return Response(data=list(['Wrong password specified']), status=status.HTTP_400_BAD_REQUEST)

    try:
        password_validation.validate_password(password=new_password, user=request.user)
    except ValidationError as e:
        return Response(data=list(e.messages), status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def do_unfollow(request):
    if request.method == 'POST':
        content_type_id = request.data.get('content_type_id', None)
        object_id = request.data.get('object_id', None)
        flag = request.data.get('flag', '')

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        unfollow(request.user, instance, flag=flag)
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_profile_filename(request):
    user = None
    profile_filename = None
    username = request.query_params.get('username', None)

    if username is not None:
        user = get_object_or_404(get_user_model(), username=username)
        profile_filename = user.profile_filename

    return Response(profile_filename)

@api_view(['GET'])
def get_user(request):
    user = None
    profile_filename = None
    username = request.query_params.get('username', None)
    email = request.query_params.get('email', None)

    if username is not None:
        user = get_object_or_404(get_user_model(), username=username)

    if email is not None:
        user = get_object_or_404(get_user_model(), email=email)

    return Response(UserSerializer(user).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_email(request):
    return Response(request.user.email)
