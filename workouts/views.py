from rest_framework import viewsets
from .serializers import ExerciseSerializer, PlanSerializer, PlanSessionSerializer, PlanSessionExerciseSerializer
from .models import Exercise, Plan, PlanSession, PlanSessionExercise

class ExercisesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class PlanViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
