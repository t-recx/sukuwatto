from rest_framework import viewsets, generics
from django_filters.rest_framework import DjangoFilterBackend
from workouts.models import Workout, WorkingWeight, WorkoutWarmUp, WorkoutSet
from workouts.serializers.workout_serializer import WorkoutSerializer, WorkoutFlatSerializer, WorkingWeightSerializer, WorkoutWarmUpSerializer, WorkoutSetSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from sqtrex.permissions import IsOwnerOrReadOnly

class WorkoutViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Workout.objects.all().order_by('-start')
    serializer_class = WorkoutSerializer
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
def get_last_workout(request):
    if request.method == 'GET':
        queryset = Workout.objects.all().order_by('-start')

        username = request.query_params.get('username', None)

        if username is not None:
            queryset = queryset.filter(user__username=username)

        plan_session = request.query_params.get('plan_session', None)

        if plan_session is not None:
            queryset = queryset.filter(plan_session=plan_session)

        date_lte = request.query_params.get('date_lte', None)

        if date_lte is not None:
            queryset = queryset.filter(start__lte=date_lte)

        queryset = queryset.first()

        serializer = WorkoutSerializer(queryset)

        return Response(serializer.data)