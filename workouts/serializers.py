from rest_framework import serializers
from .models import Exercise, Plan, PlanSession, PlanSessionGroup, PlanSessionGroupExercise, PlanSessionGroupWarmUp, PlanProgressionStrategy, PlanSessionProgressionStrategy, PlanSessionGroupProgressionStrategy, Unit, UnitConversion, Workout, WorkoutSet, WorkoutWarmUp, WorkoutGroup

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'mechanics', 'force', 'modality', 'section', 'owner']

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'name', 'abbreviation', 'system']

class UnitConversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitConversion
        fields = ['id', 'from_unit', 'to_unit', 'ratio']