import json
from django.shortcuts import get_object_or_404
from users.views import can_see_user
from users.permissions import CanSeeUserPermission
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter, BaseFilterBackend
from workouts.serializers.serializers import TopExerciseSerializer, ExerciseSerializer, UserBioDataSerializer, MetabolicEquivalentTaskSerializer, MuscleSerializer, UserSkillSerializer, WeeklyLeaderboardSerializer, MonthlyLeaderboardSerializer, YearlyLeaderboardSerializer, AllTimeLeaderboardSerializer
from workouts.models import Exercise, Unit, UserBioData, MetabolicEquivalentTask, WorkoutSet, Muscle, UserSkill, WeeklyLeaderboardPosition, MonthlyLeaderboardPosition, YearlyLeaderboardPosition, AllTimeLeaderboardPosition
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.permissions import StandardPermissionsMixin
from workouts.exercise_service import ExerciseService
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Max, F, Q, Count
from sqtrex.visibility import VisibilityQuerysetMixin, Visibility
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db.models.functions.window import RowNumber
from django.db.models.expressions import Window

class FilterByExerciseType(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        if request:
            exercise_type = request.query_params.get('exercise_type', None)

            if exercise_type:
                queryset = queryset.filter(exercise_type=exercise_type)

        return queryset

class SearchFilterByLanguage(SearchFilter):
    def get_search_fields(self, view, request):
        language = request.query_params.get('language', None)

        if language and language == 'pt':
            return ['name_pt', 'name']

        return ['name']

class OrderingFilterByLanguage(OrderingFilter):
    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)
        language = request.query_params.get('language', None)

        if params:
            fields = [param.strip() for param in params.split(',')]
            ordering = self.remove_invalid_fields(queryset, fields, view, request)
            if ordering:
                if language and language == 'pt':
                    if 'name' in ordering:
                        ordering[ordering.index('name')] = 'name_pt'

                    if '-name' in ordering:
                        ordering[ordering.index('-name')] = '-name_pt'

                return ordering

        if language and language == 'pt':
            return ['name_pt', 'mechanics', 'force', 'section', 'modality']

        return ['name', 'mechanics', 'force', 'section', 'modality']


class ExerciseViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by('name')
    serializer_class = ExerciseSerializer
    filter_backends = [SearchFilterByLanguage, FilterByExerciseType, OrderingFilterByLanguage]
    pagination_class = StandardResultsSetPagination
    ordering_fields = ['name', 'mechanics', 'force', 'section', 'modality']

class MuscleList(ListAPIView):
    queryset = Muscle.objects.all().order_by('name')
    serializer_class = MuscleSerializer

class MetabolicEquivalentTaskList(ListAPIView):
    queryset = MetabolicEquivalentTask.objects.all()
    serializer_class = MetabolicEquivalentTaskSerializer
    #permission_classes = [IsAuthenticated]

def get_leaderboard_dashboard_list(request, model, serializer):
    positions = model.objects.filter(rank__isnull=False) 
    positions_number = positions.count()
    queryset = positions
    max_rank = positions.aggregate(Max('rank'))['rank__max']

    if positions_number > 5:
        user_queryset = None
        queryset_user = None

        if request.user.is_authenticated:
            queryset_user = queryset.filter(user=request.user)

        if not queryset_user.exists():
            queryset_user = queryset

        user_queryset = queryset_user.first()

        take_previous = 2
        take_next = 2

        if user_queryset.rank == 1:
            take_previous = 0
            take_next = 4
        elif user_queryset.rank == 2:
            take_previous = 1
            take_next = 3
        elif user_queryset.rank == max_rank:
            take_previous = 4
            take_next = 0
        elif user_queryset.rank == max_rank - 1:
            take_previous = 3
            take_next = 1

        queryset = queryset.exclude(user=request.user)
        before = queryset.filter(experience__gte=user_queryset.experience).order_by('-rank')[:take_previous]
        after = queryset.exclude(id__in=before.values('id')).filter(experience__lte=user_queryset.experience).order_by('rank')[:take_next]
        queryset = before | queryset_user | after

    return Response(WeeklyLeaderboardSerializer(queryset.order_by('rank'), many=True).data)

class WeeklyLeaderboardDashboardList(ListAPIView):
    def list(self, request):
        return get_leaderboard_dashboard_list(request, WeeklyLeaderboardPosition, WeeklyLeaderboardSerializer)

class MonthlyLeaderboardDashboardList(ListAPIView):
    def list(self, request):
        return get_leaderboard_dashboard_list(request, MonthlyLeaderboardPosition, MonthlyLeaderboardSerializer)
        
class YearlyLeaderboardDashboardList(ListAPIView):
    def list(self, request):
        return get_leaderboard_dashboard_list(request, YearlyLeaderboardPosition, YearlyLeaderboardSerializer)

class AllTimeLeaderboardDashboardList(ListAPIView):
    def list(self, request):
        return get_leaderboard_dashboard_list(request, AllTimeLeaderboardPosition, AllTimeLeaderboardSerializer)

def get_leaderboard_queryset(model):
    return model.objects.filter(rank__isnull=False).order_by('rank')

class WeeklyLeaderboardList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__username']
    serializer_class = WeeklyLeaderboardSerializer

    def get_queryset(self):
        return get_leaderboard_queryset(WeeklyLeaderboardPosition)

class MonthlyLeaderboardList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__username']
    serializer_class = MonthlyLeaderboardSerializer

    def get_queryset(self):
        return get_leaderboard_queryset(MonthlyLeaderboardPosition)
        
class YearlyLeaderboardList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__username']
    serializer_class = YearlyLeaderboardSerializer

    def get_queryset(self):
        return get_leaderboard_queryset(YearlyLeaderboardPosition)

class AllTimeLeaderboardList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__username']
    serializer_class = AllTimeLeaderboardSerializer

    def get_queryset(self):
        return get_leaderboard_queryset(AllTimeLeaderboardPosition)

class UserSkillsList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [CanSeeUserPermission]

    def list(self, request):
        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        queryset = UserSkill.objects.filter(user=user).order_by('-experience')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserSkillSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = UserSkillSerializer(queryset, many=True)

        return Response(serializer.data)

@api_view(['GET'])
def get_available_chart_data(request):
    has_compound_exercises = False
    has_isolation_exercises = False
    has_distance_exercises = False
    has_weight_records = False
    has_bio_data_records = False

    visibility_provider = VisibilityQuerysetMixin()

    username = request.query_params.get('username', None)

    user = get_object_or_404(get_user_model(), username=username)
    
    if not can_see_user(request.user, user):
        return Response(status=status.HTTP_403_FORBIDDEN)

    sets = WorkoutSet.objects.filter(workout_group__workout__user__username=username).filter(done=True)

    bio_datas = visibility_provider.get_queryset_visibility(UserBioData.objects.filter(user__username=username), request.user)

    date_lte = request.query_params.get('date_lte', None)

    if date_lte is not None:
        bio_datas = bio_datas.filter(date__lte=date_lte)
        sets = sets.filter(workout_group__workout__start__lte=date_lte)

    date_gte = request.query_params.get('date_gte', None)

    if date_gte is not None:
        bio_datas = bio_datas.filter(date__gte=date_gte)
        sets = sets.filter(workout_group__workout__start__gte=date_gte)

    has_weight_records = bio_datas.filter(weight__isnull=False).filter(weight__gt=0).exists()

    has_bio_data_records = bio_datas.filter(Q(body_fat_percentage__isnull=False) | 
            Q(muscle_mass_percentage__isnull=False) |
            Q(water_weight_percentage__isnull=False)).exists()

    if not request.user or not request.user.is_authenticated:
        sets = sets.filter(workout_group__workout__visibility=Visibility.EVERYONE)
    else:
        sets = sets.exclude(Q(workout_group__workout__visibility=Visibility.OWN_USER), ~Q(workout_group__workout__user=user))

        sets = sets.exclude(Q(workout_group__workout__visibility=Visibility.FOLLOWERS), ~Q(workout_group__workout__user__followers__id=user.id), ~Q(workout_group__workout__user=user))

    strength_sets = sets.filter(exercise__exercise_type=Exercise.STRENGTH)

    cardio_sets = sets.filter(exercise__exercise_type=Exercise.CARDIO)

    has_compound_exercises = strength_sets.filter(exercise__mechanics=Exercise.COMPOUND).filter(weight__gt=0).exists()

    has_isolation_exercises = strength_sets.filter(exercise__mechanics=Exercise.ISOLATED).filter(weight__gt=0).exists()

    has_distance_exercises = cardio_sets.filter(distance__isnull=False).filter(distance__gt=0).exists()

    last_date = None

    if date_lte is not None:
        last_date = parse_datetime(date_lte)

    if last_date is None:
        last_date = timezone.now()

    has_distance_exercises_last_month = cardio_sets.filter(Q(workout_group__workout__start__year=last_date.year), Q(workout_group__workout__start__month=last_date.month)).filter(distance__isnull=False).filter(distance__gt=0).exists()

    return Response({ 
        'has_compound_exercises': has_compound_exercises
        ,'has_isolation_exercises': has_isolation_exercises
        ,'has_distance_exercises': has_distance_exercises
        ,'has_weight_records': has_weight_records
        ,'has_bio_data_records': has_bio_data_records
        ,'has_distance_exercises_last_month': has_distance_exercises_last_month
    })

@api_view(['GET'])
def get_mets(request):
    exercise_id = request.query_params.get('exercise', None)

    queryset = MetabolicEquivalentTask.objects.filter(exercise=exercise_id)

    if len(queryset) == 0:
        exercise = Exercise.objects.get(pk=exercise_id)

        queryset = MetabolicEquivalentTask.objects.filter(
            exercise__isnull=True)

        queryset = queryset.filter(
            Q(exercise_type__isnull=True) |
            Q(exercise_type=exercise.exercise_type)
        )

        if exercise.mechanics is not None:
            queryset = queryset.filter(
                Q(mechanics__isnull=True) |
                Q(mechanics=exercise.mechanics)
            )
        else:
            queryset = queryset.filter(mechanics__isnull=True)

        if exercise.force is not None:
            queryset = queryset.filter(
                Q(force__isnull=True) |
                Q(force=exercise.force)
            )
        else:
            queryset = queryset.filter(force__isnull=True)

        if exercise.modality is not None:
            queryset = queryset.filter(
                Q(modality__isnull=True) |
                Q(modality=exercise.modality)
            )
        else:
            queryset = queryset.filter(modality__isnull=True)

        if exercise.section is not None:
            queryset = queryset.filter(
                Q(section__isnull=True) |
                Q(section=exercise.section)
            )
        else:
            queryset = queryset.filter(section__isnull=True)

    serializer = MetabolicEquivalentTaskSerializer(queryset, many=True)

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_top_exercises(request):
    exercise_type = request.query_params.get('exercise_type', None)

    queryset = (WorkoutSet.objects 
        .filter(workout_group__workout__user=request.user)
        .filter(done=True))

    if exercise_type:
        queryset = queryset.filter(exercise__exercise_type=exercise_type)

    queryset = (queryset 
        .values('exercise__id', 'exercise__name', 'exercise__exercise_type', 'exercise__description', 'exercise__mechanics', 'exercise__force', 'exercise__modality', 'exercise__section', 'exercise__level')
        .annotate(count=Count('exercise'))
        .order_by('-count'))

    return Response(TopExerciseSerializer(queryset, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exercise_in_use(request):
    es = ExerciseService()
    exid = request.query_params.get('exercise', None)

    return Response(es.in_use(exid))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exercise_in_use_in_other_users_resources(request):
    es = ExerciseService()
    exid = request.query_params.get('exercise', None)

    return Response(es.in_use_on_other_users_resources(exid, request.user))
