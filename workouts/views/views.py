from rest_framework import viewsets
from rest_framework.generics import ListAPIView
from workouts.serializers.serializers import ExerciseSerializer, UnitSerializer, UnitConversionSerializer, UserBioDataSerializer
from workouts.models import Exercise, Unit, UnitConversion, UserBioData
from sqtrex.pagination import StandardResultsSetPagination
from django_filters.rest_framework import DjangoFilterBackend
from sqtrex.permissions import StandardPermissionsMixin

class ExerciseViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed or edited.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_submitted']

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