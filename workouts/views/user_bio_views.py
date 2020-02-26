from workouts.serializers.serializers import UserBioDataSerializer
from workouts.models import UserBioData
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from sqtrex.permissions import IsOwnerOrReadOnly

class UserBioDataViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users bio data to be viewed or edited.
    """
    queryset = UserBioData.objects.all()
    serializer_class = UserBioDataSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user__username']
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'destroy':
            permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'list' or self.action == 'retrieve':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]

@api_view(['GET'])
def get_last_user_bio_data(request):
    if request.method == 'GET':
        queryset = UserBioData.objects.all().order_by('-date')

        username = request.query_params.get('username', None)

        if username is not None:
            queryset = queryset.filter(user__username=username)

        date_lte = request.query_params.get('date_lte', None)

        if date_lte is not None:
            queryset = queryset.filter(date__lte=date_lte)

        queryset = queryset.first()

        serializer = UserBioDataSerializer(queryset)

        return Response(serializer.data)