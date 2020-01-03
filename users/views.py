from actstream.models import followers, following
from actstream.actions import follow, unfollow
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser
from .serializers import UserSerializer, GroupSerializer, FileSerializer
from pprint import pprint
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

# todo: limit account creation with a captcha or ip somehow...
# maybe consider changing registration to this: https://github.com/apragacz/django-rest-registration
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = get_user_model().objects.all().order_by('-date_joined')
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
            # todo: maybe create a special permission here that will only AllowAny if there's a specified 
            # username filter
            # todo: also check if user allows a public profile maybe??
            permission_classes = [AllowAny]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'destroy':
            permission_classes = [IsOwnerOrReadOnly|IsAdminUser]
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

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj == request.user

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
def do_unfollow(request):
    if request.method == 'POST':
        content_type_id = request.data.get('content_type_id', None)
        object_id = request.data.get('object_id', None)
        flag = request.data.get('flag', '')

        ctype = get_object_or_404(ContentType, pk=content_type_id)
        instance = get_object_or_404(ctype.model_class(), pk=object_id)

        unfollow(request.user, instance, flag=flag)
        return Response(status=status.HTTP_204_NO_CONTENT)