from rest_framework import viewsets
from workouts.serializers.serializers import ExerciseSerializer, UnitSerializer, UnitConversionSerializer, UserBioDataSerializer
from workouts.models import Exercise, Unit, UnitConversion, UserBioData
from workouts.pagination import StandardResultsSetPagination

class ExerciseViewSet(viewsets.ModelViewSet):
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