from rest_framework import viewsets
from .serializers import ExerciseSerializer, PlanSerializer, PlanSessionSerializer, PlanSessionExerciseSerializer, UnitSerializer, UnitConversionSerializer, WorkoutSerializer
from .models import Exercise, Plan, PlanSession, PlanSessionExercise, Unit, UnitConversion, Workout

class ExercisesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class UnitViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows units to be viewed or edited.
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class UnitConversionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows units to be viewed or edited.
    """
    queryset = UnitConversion.objects.all()
    serializer_class = UnitConversionSerializer

class PlanViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

class WorkoutViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
