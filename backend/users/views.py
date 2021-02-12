from sqtrex.pagination import StandardResultsSetPagination
from rest_framework import mixins
from rest_framework import permissions
from django.contrib.auth.models import AnonymousUser
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
from .serializers import UserSerializer, UserRegistrationSerializer, UserHiddenSerializer, UserMinimalSerializer, GroupSerializer, FileSerializer, ExpressInterestSerializer, CustomTokenObtainPairSerializer
from sqtrex.serializers import ActionSerializer
from django.shortcuts import get_object_or_404
from sqtrex.permissions import IsUserOrReadOnly
from users.models import CustomUser, UserInterest
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from sqtrex.visibility import Visibility
from django.db.models import Q
from django.utils.safestring import mark_safe
from sqtrex.visibility import VisibilityQuerysetMixin
from social.models import UserAction
from rest_framework.filters import SearchFilter
from rest_framework_simplejwt.views import TokenViewBase, TokenCookieViewMixin
from users.permissions import CanSeeUserPermission, can_see_user

class FollowersList(generics.ListAPIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [CanSeeUserPermission]

    def list(self, request):
        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        if not can_see_user(request.user, user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        queryset = user.followers.all().order_by('username')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserMinimalSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = UserMinimalSerializer(queryset, many=True)

        return Response(serializer.data)

class FollowingList(generics.ListAPIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [CanSeeUserPermission]

    def list(self, request):
        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        if not can_see_user(request.user, user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        queryset = user.following.all().order_by('username')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserMinimalSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = UserMinimalSerializer(queryset, many=True)

        return Response(serializer.data)

class FollowRequestsList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        queryset = request.user.follower_requests.all().order_by('username')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserMinimalSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = UserMinimalSerializer(queryset, many=True)

        return Response(serializer.data)

class UserListView(generics.ListAPIView, VisibilityQuerysetMixin):
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['username']
    queryset = get_user_model().objects.order_by('username').all()
    serializer_class = UserMinimalSerializer

    def get_queryset(self): 
        return self.get_queryset_visibility_user_model(get_user_model().objects.all().order_by('username'), self.request.user)

class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = get_user_model().objects.order_by('username').all()
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        instance = serializer.save()

        instance.set_password(instance.password)
        
        instance.save()

class UserViewSet(mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   mixins.DestroyModelMixin,
                   mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    pagination_class = StandardResultsSetPagination
    queryset = get_user_model().objects.order_by('username').all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['username', 'email']

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAdminUser]
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
        if not user or not user.is_authenticated:
            queryset = queryset.exclude(Q(target_workout__isnull=False), ~Q(target_workout__visibility=Visibility.EVERYONE))
            queryset = queryset.exclude(Q(action_object_workout__isnull=False), ~Q(action_object_workout__visibility=Visibility.EVERYONE))
            queryset = queryset.exclude(Q(target_user_bio_data__isnull=False), ~Q(target_user_bio_data__visibility=Visibility.EVERYONE))
            queryset = queryset.exclude(Q(action_object_user_bio_data__isnull=False), ~Q(action_object_user_bio_data__visibility=Visibility.EVERYONE))
        else:
            queryset = queryset.exclude(Q(target_workout__isnull=False), Q(target_workout__visibility=Visibility.OWN_USER), ~Q(target_workout__user=user))
            queryset = queryset.exclude(Q(target_workout__isnull=False), Q(target_workout__visibility=Visibility.FOLLOWERS), ~Q(target_workout__user__followers__id=user.id), ~Q(target_workout__user=user))

            queryset = queryset.exclude(Q(action_object_workout__isnull=False), Q(action_object_workout__visibility=Visibility.OWN_USER), ~Q(action_object_workout__user=user))
            queryset = queryset.exclude(Q(action_object_workout__isnull=False), Q(action_object_workout__visibility=Visibility.FOLLOWERS), ~Q(action_object_workout__user__followers__id=user.id), ~Q(action_object_workout__user=user))

            queryset = queryset.exclude(Q(target_user_bio_data__isnull=False), Q(target_user_bio_data__visibility=Visibility.OWN_USER), ~Q(target_user_bio_data__user=user))
            queryset = queryset.exclude(Q(target_user_bio_data__isnull=False), Q(target_user_bio_data__visibility=Visibility.FOLLOWERS), ~Q(target_user_bio_data__user__followers__id=user.id), ~Q(target_user_bio_data__user=user))

            queryset = queryset.exclude(Q(action_object_user_bio_data__isnull=False), Q(action_object_user_bio_data__visibility=Visibility.OWN_USER), ~Q(action_object_user_bio_data__user=user))
            queryset = queryset.exclude(Q(action_object_user_bio_data__isnull=False), Q(action_object_user_bio_data__visibility=Visibility.FOLLOWERS), ~Q(action_object_user_bio_data__user__followers__id=user.id), ~Q(action_object_user_bio_data__user=user))

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
        return UserAction.objects.filter(Q(user__followers__id=request.user.id) | Q(user=request.user)).order_by('-timestamp').distinct()

class ActorStreamList(StreamList):
    permission_classes = [CanSeeUserPermission]

    def get_stream_queryset(self, request):
        user = None

        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        return UserAction.objects.filter(user=user).order_by('-timestamp')

class ExpressInterestCreate(generics.CreateAPIView):
    serializer_class = ExpressInterestSerializer

@api_view(['GET'])
def user_exists(request):
    username = request.query_params.get('username', None)

    if username is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    return Response(get_user_model().objects.filter(username=username).exists())

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def follow_request_number(request):
    return Response(request.user.follower_requests.count())

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_is_following(request):
    username = request.query_params.get('username', None)

    user = get_object_or_404(get_user_model(), username=username)

    return Response({ "following": request.user.following.filter(id=user.id).exists(), "requested": user.follower_requests.filter(id=request.user.id).exists() })

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
    user_id = request.data.get('user_id', None)
    instance = get_object_or_404(get_user_model(), pk=user_id)

    return follow_user(request.user, instance, False)

def follow_user(requesting_user, followed_user, bypass_approval):
    if not followed_user.followers.filter(id=requesting_user.id).exists():
        if followed_user.follow_approval_required and not bypass_approval:
            if not followed_user.follower_requests.filter(id=requesting_user.id).exists():
                followed_user.follower_requests.add(requesting_user)
                return Response({"requested": True, "followed": False}, status=status.HTTP_201_CREATED)

            return Response({"requested": True, "followed": False}, status=status.HTTP_204_NO_CONTENT)

        if followed_user.follower_requests.filter(id=requesting_user.id).exists():
            followed_user.follower_requests.remove(requesting_user)

        followed_user.followers.add(requesting_user)
        followed_user.followers_number += 1
        followed_user.save()
        requesting_user.following.add(followed_user)
        requesting_user.followings_number += 1
        requesting_user.save()

        if not UserAction.objects.filter(user=requesting_user, verb='started following', target_user=followed_user).exists():
            UserAction.objects.create(user=requesting_user, verb='started following', target_user=followed_user)

        return Response({"requested": False, "followed": True}, status=status.HTTP_201_CREATED)

    return Response({"requested": False, "followed": True}, status=status.HTTP_204_NO_CONTENT)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def do_unfollow(request):
    user_id = request.data.get('user_id', None)
    instance = get_object_or_404(get_user_model(), pk=user_id)

    if instance.followers.filter(id=request.user.id).exists():
        instance.followers.remove(request.user)
        instance.followers_number -= 1
        instance.save()
        request.user.following.remove(instance)
        request.user.followings_number -= 1
        request.user.save()

        UserAction.objects.filter(user=request.user, verb='started following', target_user=instance).delete()

        return Response(status=status.HTTP_201_CREATED)

    if instance.follower_requests.filter(id=request.user.id).exists():
        instance.follower_requests.remove(request.user)

        return Response(status=status.HTTP_201_CREATED)

    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_follow_request(request):
    user_id = request.data.get('user_id', None)
    instance = get_object_or_404(get_user_model(), pk=user_id)

    if request.user.follower_requests.filter(id=user_id).exists():
        return follow_user(instance, request.user,  True)
    elif request.user.followers.filter(id=user_id):
        return Response({"requested": False, "followed": True}, status=status.HTTP_204_NO_CONTENT)

    return Response({"requested": False, "followed": False}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_follow_request(request):
    user_id = request.data.get('user_id', None)
    instance = get_object_or_404(get_user_model(), pk=user_id)

    if request.user.follower_requests.filter(id=user_id).exists():
        request.user.follower_requests.remove(instance)

    return Response({"requested": False, "followed": False}, status=status.HTTP_204_NO_CONTENT)


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

    if username is not None:
        user = get_object_or_404(get_user_model(), username=username)

    if can_see_user(request.user, user):
        return Response(UserSerializer(user).data)

    return Response(UserHiddenSerializer(user).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_email(request):
    return Response(request.user.email)

class CustomTokenObtainPairView(TokenCookieViewMixin, TokenViewBase):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token pair to prove the authentication of those credentials.
    """
    serializer_class = CustomTokenObtainPairSerializer

token_obtain_pair = CustomTokenObtainPairView.as_view()