import json
from django.shortcuts import get_object_or_404
from users.views import can_see_user
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter, BaseFilterBackend
from workouts.serializers.serializers import ExerciseSerializer, UserBioDataSerializer, MetabolicEquivalentTaskSerializer, MuscleSerializer
from workouts.models import Exercise, Unit, UserBioData, MetabolicEquivalentTask, WorkoutSet, Muscle
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.permissions import StandardPermissionsMixin
from workouts.exercise_service import ExerciseService
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from sqtrex.visibility import VisibilityQuerysetMixin, Visibility

class FilterByExerciseType(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        if request:
            exercise_type = request.query_params.get('exercise_type', None)

            if exercise_type:
                queryset = queryset.filter(exercise_type=exercise_type)

        return queryset

class ExerciseViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all().order_by('name')
    serializer_class = ExerciseSerializer
    filter_backends = [SearchFilter, FilterByExerciseType, OrderingFilter]
    pagination_class = StandardResultsSetPagination
    search_fields = ['name']
    ordering_fields = ['name', 'mechanics', 'force', 'section', 'modality']

class MuscleList(ListAPIView):
    queryset = Muscle.objects.all().order_by('name')
    serializer_class = MuscleSerializer

class MetabolicEquivalentTaskList(ListAPIView):
    queryset = MetabolicEquivalentTask.objects.all()
    serializer_class = MetabolicEquivalentTaskSerializer
    #permission_classes = [IsAuthenticated]

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

    has_compound_exercises = strength_sets.filter(exercise__mechanics=Exercise.COMPOUND).exists()

    has_isolation_exercises = strength_sets.filter(exercise__mechanics=Exercise.ISOLATED).exists()

    has_distance_exercises = cardio_sets.filter(distance__isnull=False).filter(distance__gt=0).exists()

    return Response({ 
        'has_compound_exercises': has_compound_exercises
        ,'has_isolation_exercises': has_isolation_exercises
        ,'has_distance_exercises': has_distance_exercises
        ,'has_weight_records': has_weight_records
        ,'has_bio_data_records': has_bio_data_records
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