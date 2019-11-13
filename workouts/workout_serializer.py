from rest_framework import serializers
from .models import Workout, WorkoutSet, WorkoutWarmUp, WorkoutGroup

class WorkoutSetSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutSet()._meta.get_field('id'), required=False)
    class Meta:
        model = WorkoutSet
        fields = ['id', 'order', 'start', 'end', 'exercise', 'number_of_repetitions', 'weight', 'unit']

class WorkoutWarmUpSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutWarmUp()._meta.get_field('id'), required=False)
    class Meta:
        model = WorkoutWarmUp
        fields = ['id', 'order', 'start', 'end', 'exercise', 'number_of_repetitions', 'weight', 'unit']

class WorkoutGroupSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutGroup()._meta.get_field('id'), required=False)
    sets = WorkoutSetSerializer(many=True, required=False)
    warmups = WorkoutWarmUpSerializer(many=True, required=False)

    class Meta:
        model = WorkoutGroup
        fields = ['id', 'order', 'name', 'sets', 'warmups']

class WorkoutSerializer(serializers.ModelSerializer):
    # todo: define create and update methods
    groups = WorkoutGroupSerializer(many=True, required=False)

    class Meta:
        model = Workout
        fields = ['id', 'start', 'end', 'plan_session', 'user', 'groups']
