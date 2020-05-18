from workouts.serializers.serializers import UserBioDataSerializer
from workouts.models import UserBioData
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework import viewsets, generics
from sqtrex.permissions import StandardPermissionsMixin

class UserBioDataViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows users bio data to be viewed or edited.
    """
    queryset = UserBioData.objects.all()
    serializer_class = UserBioDataSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user__username']
    pagination_class = StandardResultsSetPagination

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