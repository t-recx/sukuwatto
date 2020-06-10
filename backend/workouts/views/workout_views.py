from rest_framework import viewsets, generics
from django_filters.rest_framework import DjangoFilterBackend
from workouts.models import Workout, WorkingParameter, WorkoutWarmUp, WorkoutSet, WorkoutGroup
from workouts.serializers.workout_serializer import WorkoutSerializer, WorkoutFlatSerializer, WorkingParameterSerializer, WorkoutWarmUpSerializer, WorkoutSetSerializer, WorkoutGroupSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from sqtrex.permissions import IsOwnerOrReadOnly
from sqtrex.permissions import StandardPermissionsMixin

class WorkoutViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Workout.objects.all().order_by('-start')
    serializer_class = WorkoutSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user__username']
    pagination_class = StandardResultsSetPagination

@api_view(['GET'])
def get_last_workout(request):
    if request.method == 'GET':
        queryset = Workout.objects.all().order_by('-start')

        username = request.query_params.get('username', None)

        if username is not None:
            queryset = queryset.filter(user__username=username)

        plan = request.query_params.get('plan', None)

        if plan is not None:
            queryset = queryset.filter(plan=plan)

        plan_session = request.query_params.get('plan_session', None)

        if plan_session is not None:
            queryset = queryset.filter(plan_session=plan_session)

        date_lte = request.query_params.get('date_lte', None)

        if date_lte is not None:
            queryset = queryset.filter(start__lte=date_lte)

        queryset = queryset.first()

        serializer = WorkoutSerializer(queryset)

        return Response(serializer.data)

@api_view(['GET'])
def get_last_workout_group(request):
    if request.method == 'GET':
        queryset = WorkoutGroup.objects.all().order_by('-workout__start')

        username = request.query_params.get('username', None)

        if username is not None:
            queryset = queryset.filter(workout__user__username=username)

        plan_session_group = request.query_params.get('plan_session_group', None)

        if plan_session_group is not None:
            queryset = queryset.filter(plan_session_group=plan_session_group)

        date_lte = request.query_params.get('date_lte', None)

        if date_lte is not None:
            queryset = queryset.filter(workout__start__lte=date_lte)

        queryset = queryset.first()

        serializer = WorkoutGroupSerializer(queryset)

        return Response(serializer.data)