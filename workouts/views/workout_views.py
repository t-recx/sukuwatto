from rest_framework import viewsets
from workouts.models import Workout, WorkingWeight
from workouts.serializers.workout_serializer import WorkoutSerializer, WorkingWeightSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

class WorkoutViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer

@api_view(['GET'])
def working_weights(request):
    if request.method == 'GET':
        queryset = WorkingWeight.objects.all()
        workouts = None

        date_lte = request.query_params.get('date_lte', None)
        username = request.query_params.get('username', None)

        if date_lte is not None:
            workouts = Workout.objects.filter(start__lte=date_lte).order_by('-start')

        if username is not None:
            workouts = Workout.objects.filter(user__username=username)

        if workouts is not None:
            queryset.objects.filter(workout=workouts[0])

        serializer = WorkingWeightSerializer(queryset)

        return Response(serializer.data)