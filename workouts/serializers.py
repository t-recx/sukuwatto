from rest_framework import serializers
from .models import Exercise, WorkoutPlanTemplate, WorkoutPlanSessionTemplate, WorkoutPlanSessionExerciseTemplate, WorkoutPlanSessionTemplateSchedule

class ExerciseSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'mechanics', 'force', 'modality', 'section', 'owner']

class WorkoutPlanTemplateSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = WorkoutPlanTemplate
        fields = ['id', 'short_name', 'name', 'description', 'owner']

class WorkoutPlanSessionTemplateSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = WorkoutPlanSessionTemplate
        fields = ['id', 'name', 'workout_plan_template']

class WorkoutPlanSessionExerciseTemplateSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = WorkoutPlanSessionExerciseTemplate
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'number_of_repetitions', 'number_of_repetitions_up_to', 'workout_plan_session_template']

class WorkoutPlanSessionTemplateScheduleSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = WorkoutPlanSessionTemplateSchedule
        fields = ['id', 'order', 'workout_plan_session', 'workout_plan_session_template']