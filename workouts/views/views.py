from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter
from workouts.serializers.serializers import ExerciseSerializer, UnitSerializer, UnitConversionSerializer, UserBioDataSerializer
from workouts.models import Exercise, Unit, UnitConversion, UserBioData
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.permissions import StandardPermissionsMixin
from workouts.exercise_service import ExerciseService
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated

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