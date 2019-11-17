from rest_framework import viewsets
from .serializers import ExerciseSerializer, UnitSerializer, UnitConversionSerializer
from .models import Exercise, Unit, UnitConversion, Workout
from .workout_serializer import WorkoutSerializer

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

class WorkoutViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
