from rest_framework import viewsets, generics, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter, BaseFilterBackend
from workouts.models import Workout, WorkingParameter, WorkoutWarmUp, WorkoutSet, WorkoutGroup, WorkoutSetPosition
from workouts.serializers.workout_serializer import WorkoutSerializer, WorkoutFlatSerializer, WorkoutNoPositionsSerializer, WorkoutSetPositionSerializer, WorkingParameterSerializer, WorkoutWarmUpSerializer, WorkoutSetSerializer, WorkoutGroupSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from sqtrex.permissions import IsOwnerOrReadOnly
from sqtrex.permissions import StandardPermissionsMixin
from sqtrex.visibility import VisibilityQuerysetMixin
from django.http import Http404
from django.shortcuts import get_object_or_404

class WorkoutViewSet(StandardPermissionsMixin, VisibilityQuerysetMixin, viewsets.ModelViewSet):
    """
    """
    serializer_class = WorkoutSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {'user__username':['exact'], 'start': ['gte', 'lte']}
    search_fields = ['name', 'plan__name', 'plan__short_name']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return self.get_queryset_visibility(Workout.objects.all().order_by('-start'), self.request.user)

    def get_object(self):
        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        queryset = self.get_queryset_visibility(Workout.objects.filter(**filter_kwargs), self.request.user)

        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj


@api_view(['GET'])
def get_workouts_by_date(request):
    visibility_provider = VisibilityQuerysetMixin()

    queryset = visibility_provider.get_queryset_visibility(Workout.objects.all().order_by('-start'), request.user)

    username = request.query_params.get('username', None)

    if username is not None:
        queryset = queryset.filter(user__username=username)

    date_lte = request.query_params.get('date_lte', None)

    if date_lte is not None:
        queryset = queryset.filter(start__lte=date_lte)

    date_gte = request.query_params.get('date_gte', None)

    if date_gte is not None:
        queryset = queryset.filter(start__gte=date_gte)

    serializer = WorkoutNoPositionsSerializer(queryset, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def get_last_workout_position(request):
    queryset = WorkoutSetPosition.objects.all().order_by('-id')

    username = request.query_params.get('username', None)

    if username is not None:
        queryset = queryset.filter(workout_activity__workout_group__workout__user__username=username)

    queryset = queryset.first()

    serializer = WorkoutSetPositionSerializer(queryset)

    return Response(serializer.data)

@api_view(['GET'])
def workout_visible(request):
    workout_id = request.query_params.get('id', None)

    if workout_id is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    visibility_provider = VisibilityQuerysetMixin()

    queryset = visibility_provider.get_queryset_visibility(Workout.objects.filter(id=workout_id), request.user)

    return Response(queryset.exists())

@api_view(['GET'])
def workout_editable(request):
    workout_id = request.query_params.get('id', None)

    if workout_id is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    workout = get_object_or_404(Workout, pk=workout_id)

    return Response(workout.user==request.user)

@api_view(['GET'])
def get_last_workout(request):
    queryset = Workout.objects.all().order_by('-start')

    queryset = queryset.filter(user=request.user)

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
    queryset = WorkoutGroup.objects.all().order_by('-workout__start')

    queryset = queryset.filter(workout__user=request.user)

    plan_session_group = request.query_params.get('plan_session_group', None)

    if plan_session_group is not None:
        queryset = queryset.filter(plan_session_group=plan_session_group)

    date_lte = request.query_params.get('date_lte', None)

    if date_lte is not None:
        queryset = queryset.filter(workout__start__lte=date_lte)

    queryset = queryset.first()

    serializer = WorkoutGroupSerializer(queryset)

    return Response(serializer.data)