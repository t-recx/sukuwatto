from rest_framework import viewsets
from .serializers import ExerciseSerializer, WorkoutPlanTemplateSerializer, WorkoutPlanSessionTemplateSerializer, WorkoutPlanSessionExerciseTemplateSerializer, WorkoutPlanSessionTemplateScheduleSerializer
from .models import Exercise, WorkoutPlanTemplate, WorkoutPlanSessionTemplate, WorkoutPlanSessionExerciseTemplate, WorkoutPlanSessionTemplateSchedule

class ExercisesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class WorkoutPlanTemplateViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = WorkoutPlanTemplate.objects.all()
    serializer_class = WorkoutPlanTemplateSerializer

class WorkoutPlanSessionTemplateViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = WorkoutPlanSessionTemplate.objects.all()
    serializer_class = WorkoutPlanSessionTemplateSerializer

class WorkoutPlanSessionExerciseTemplateViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = WorkoutPlanSessionExerciseTemplate.objects.all()
    serializer_class = WorkoutPlanSessionExerciseTemplateSerializer

class WorkoutPlanSessionTemplateScheduleViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = WorkoutPlanSessionTemplateSchedule.objects.all()
    serializer_class = WorkoutPlanSessionTemplateScheduleSerializer
