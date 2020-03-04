from sqtrex.pagination import StandardResultsSetPagination
from actstream.models import followers, following
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
from .serializers import UserSerializer, GroupSerializer, FileSerializer
from sqtrex.serializers import ActionSerializer
from django.shortcuts import get_object_or_404
from actstream import models
from sqtrex.permissions import IsUserOrReadOnly
from users.models import CustomUser

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['username']

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
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_stream_queryset(self, request):
        pass

    def list(self, request):
        queryset = self.get_stream_queryset(request)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = ActionSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = ActionSerializer(queryset, many=True)

        return Response(serializer.data)

class UserStreamList(StreamList):
    def get_stream_queryset(self, request):
        return models.user_stream(request.user, with_user_activity=True)

class ActorStreamList(StreamList):
    def get_stream_queryset(self, request):
        user = None

        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        return models.actor_stream(user)

@api_view(['GET'])
def get_followers(request):
    if request.method == 'GET':
        user = None
        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        if user is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        queryset = followers(user)
        serializer = UserSerializer(queryset, many=True)

        return Response(serializer.data)

@api_view(['GET'])
def get_following(request):
    if request.method == 'GET':
        user = None
        username = request.query_params.get('username', None)

        if username is not None:
            user = get_object_or_404(get_user_model(), username=username)

        if user is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        queryset = following(user, get_user_model())
        serializer = UserSerializer(queryset, many=True)

        return Response(serializer.data)

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
@permission_classes([IsAuthenticated])
def get_email(request):
    return Response(request.user.email)
