from sqtrex.visibility import VisibilityQuerysetMixin
from workouts.models import WorkoutSet, Workout, UserBioData
from workouts.serializers.chart_serializers import ChartDistanceMonthSerializer, ChartWeightSerializer, ChartStrengthSerializer
from django.db.models.functions import TruncDate
from django.db.models import Sum, Max
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend

class ChartWeightList(VisibilityQuerysetMixin, ListAPIView):
    queryset = UserBioData.objects.filter(weight__isnull=False)
    serializer_class = ChartWeightSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {'user__username':['exact'], 'date':['gte', 'lte']}

    def get_queryset(self):
        return self.get_queryset_visibility(UserBioData.objects.filter(weight__isnull=False).order_by('-date'), self.request.user)

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

        queryset = self.get_queryset_visibility(UserBioData.objects.filter(**filter_kwargs), self.request.user)

        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

@api_view(['GET'])
def chart_distance_month(request):
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

    queryset = (WorkoutSet.objects.filter(workout_group__workout__id__in=queryset.values('id'))
        .exclude(distance__isnull=True)
        .filter(done=True)
        .annotate(date=TruncDate('workout_group__workout__start'))
        .values('date','distance_unit', 'exercise__name')
        .annotate(distance=Sum('distance')))

    return Response(ChartDistanceMonthSerializer(queryset, many=True).data)

@api_view(['GET'])
def chart_strength_progress(request):
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

    mechanics = request.query_params.get('mechanics', None)

    queryset = (WorkoutSet.objects.filter(workout_group__workout__id__in=queryset.values('id'))
        .filter(exercise__exercise_type='s')
        .filter(done=True)
        .exclude(weight__isnull=True)
        .exclude(weight__lte=0))

    if mechanics is not None:
        queryset = queryset.filter(exercise__mechanics=mechanics)

    queryset = (queryset
        .annotate(date=TruncDate('workout_group__workout__start'))
        .values('date','weight_unit', 'exercise__short_name')
        .annotate(weight=Max('weight')))

    return Response(ChartStrengthSerializer(queryset, many=True).data)