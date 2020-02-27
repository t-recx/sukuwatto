from rest_framework import viewsets
from rest_framework.generics import ListAPIView
from workouts.serializers.serializers import ExerciseSerializer, UnitSerializer, UnitConversionSerializer, UserBioDataSerializer
from workouts.models import Exercise, Unit, UnitConversion, UserBioData
from sqtrex.pagination import StandardResultsSetPagination

class ExerciseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class UnitList(ListAPIView):
    """
    API endpoint that allows units to be viewed 
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class UnitConversionList(ListAPIView):
    """
    API endpoint that allows units to be viewed 
    """
    queryset = UnitConversion.objects.all()
    serializer_class = UnitConversionSerializer