from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter
from workouts.serializers.serializers import ExerciseSerializer, UserBioDataSerializer, MetabolicEquivalentTaskSerializer
from workouts.models import Exercise, Unit, UserBioData, MetabolicEquivalentTask
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.permissions import StandardPermissionsMixin
from workouts.exercise_service import ExerciseService
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

class ExerciseViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = StandardResultsSetPagination
    search_fields = ['name']
    ordering_fields = ['name', 'mechanics', 'force', 'section', 'modality']

class MetabolicEquivalentTaskList(ListAPIView):
    queryset = MetabolicEquivalentTask.objects.all()
    serializer_class = MetabolicEquivalentTaskSerializer
    #permission_classes = [IsAuthenticated]

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