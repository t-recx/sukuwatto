from rest_framework import serializers
from social.serializers import UserSerializer
from workouts.models import Workout, WorkoutSet, WorkoutWarmUp, WorkoutGroup, WorkingParameter, Exercise
from workouts.utils import get_differences
from workouts.serializers.serializers import ExerciseSerializer
from pprint import pprint
from django.contrib.auth import get_user_model

class WorkingParameterSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()
    id = serializers.ModelField(model_field=WorkingParameter()._meta.get_field('id'), required=False)
    unit_code = serializers.SerializerMethodField()
    previous_unit_code = serializers.SerializerMethodField()

    def get_unit_code(self, obj):
        if obj.unit:
            return obj.unit.abbreviation
        
        return None

    def get_previous_unit_code(self, obj):
        if obj.previous_unit:
            return obj.previous_unit.abbreviation
        
        return None

    class Meta:
        model = WorkingParameter
        fields = ['id', 'exercise', 'parameter_value', 'unit', 'unit_code', 'previous_unit_code', 'previous_parameter_value', 'previous_unit', 'manually_changed']
    

class WorkoutSetSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()
    id = serializers.ModelField(model_field=WorkoutSet()._meta.get_field('id'), required=False)
    unit_code = serializers.SerializerMethodField()
    speed_unit_code = serializers.SerializerMethodField()
    distance_unit_code = serializers.SerializerMethodField()
    time_unit_code = serializers.SerializerMethodField()

    def get_unit_code(self, obj):
        if obj.unit:
            return obj.unit.abbreviation
        
        return None

    def get_speed_unit_code(self, obj):
        if obj.speed_unit:
            return obj.speed_unit.abbreviation
        
        return None

    def get_time_unit_code(self, obj):
        if obj.time_unit:
            return obj.time_unit.abbreviation
        
        return None

    def get_distance_unit_code(self, obj):
        if obj.distance_unit:
            return obj.distance_unit.abbreviation
        
        return None

    class Meta:
        model = WorkoutSet
        fields = ['id', 'order', 'start', 'end', 'exercise', 'repetition_type', 'expected_number_of_repetitions', 'expected_number_of_repetitions_up_to', 'number_of_repetitions', 'weight', 'unit', 'unit_code', 'done', 'plan_session_group_activity', 'working_weight_percentage', 'in_progress',
            'speed_type', 'expected_speed', 'expected_speed_up_to', 'speed',
            'vo2max_type', 'expected_vo2max', 'expected_vo2max_up_to', 'vo2max',
            'distance_type', 'expected_distance', 'expected_distance_up_to', 'distance',
            'time_type', 'expected_time', 'expected_time_up_to', 'time',
            'working_distance_percentage',
            'working_time_percentage',
            'working_speed_percentage',
            'speed_unit', 'time_unit', 'distance_unit',
            'speed_unit_code', 'time_unit_code', 'distance_unit_code'
        ]

class WorkoutWarmUpSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()
    id = serializers.ModelField(model_field=WorkoutWarmUp()._meta.get_field('id'), required=False)
    unit_code = serializers.SerializerMethodField()

    def get_unit_code(self, obj):
        if obj.unit:
            return obj.unit.abbreviation
        
        return None

    class Meta:
        model = WorkoutWarmUp
        fields = ['id', 'order', 'start', 'end', 'exercise', 'repetition_type', 'expected_number_of_repetitions', 'expected_number_of_repetitions_up_to', 'number_of_repetitions', 'weight', 'unit', 'unit_code', 'done', 'plan_session_group_activity', 'working_weight_percentage', 'in_progress',
            'speed_type', 'expected_speed', 'expected_speed_up_to', 'speed',
            'vo2max_type', 'expected_vo2max', 'expected_vo2max_up_to', 'vo2max',
            'distance_type', 'expected_distance', 'expected_distance_up_to', 'distance',
            'time_type', 'expected_time', 'expected_time_up_to', 'time',
            'working_distance_percentage',
            'working_time_percentage',
            'working_speed_percentage',
            'speed_unit', 'time_unit', 'distance_unit'
        ]

class WorkoutGroupSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutGroup()._meta.get_field('id'), required=False)
    sets = WorkoutSetSerializer(many=True, required=False)
    warmups = WorkoutWarmUpSerializer(many=True, required=False)

    class Meta:
        model = WorkoutGroup
        fields = ['id', 'order', 'name', 'sets', 'warmups', 'plan_session_group']

class WorkoutFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'start', 'end', 'name', 'notes', 'plan', 'plan_session', 'user']

class WorkoutSerializer(serializers.ModelSerializer):
    groups = WorkoutGroupSerializer(many=True, required=False)
    working_parameters = WorkingParameterSerializer(many=True, required=False)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Workout
        fields = ['id', 'start', 'end', 'name', 'notes', 'plan', 'plan_session', 'groups', 'working_parameters', 'user', 'status']
        extra_kwargs = {'user': {'required': False}}

    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        groups_data = None
        working_parameters_data = None

        if 'groups' in validated_data:
            groups_data = validated_data.pop('groups')

        if 'working_parameters' in validated_data:
            working_parameters_data = validated_data.pop('working_parameters')

        workout = Workout.objects.create(user=user, **validated_data)

        if groups_data is not None:
            self.create_groups(workout, groups_data)

        if working_parameters_data is not None:
            self.create_working_parameters(workout, working_parameters_data)

        return workout

    def create_working_parameters(self, workout, working_parameters_data):
        for working_parameter_data in working_parameters_data:
            exercise = working_parameter_data.pop('exercise')
            exercise_model = Exercise.objects.get(pk=exercise['id'])
            WorkingParameter.objects.create(workout=workout, exercise=exercise_model, 
                **working_parameter_data)

    def create_groups(self, workout, groups_data):
        for group_data in groups_data:
            sets_data = None
            warmups_data = None

            if 'sets' in group_data:
                sets_data = group_data.pop('sets')

            if 'warmups' in group_data:
                warmups_data = group_data.pop('warmups')

            group = WorkoutGroup.objects.create(workout=workout, **group_data)

            if sets_data is not None:
                self.create_group_activities(WorkoutSet, group, sets_data)

            if warmups_data is not None:
                self.create_group_activities(WorkoutWarmUp, group, warmups_data)

    def create_group_activities(self, model, workout_group, activities_data):
        for activity_data in activities_data:
            exercise = activity_data.pop('exercise')
            exercise_model = Exercise.objects.get(pk=exercise['id'])

            model.objects.create(workout_group=workout_group, exercise=exercise_model, 
                **activity_data)

    def update(self, instance, validated_data):
        instance.start = validated_data.get('start', instance.start)
        instance.end = validated_data.get('end', instance.end)
        instance.name = validated_data.get('name', instance.name)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.plan = validated_data.get('plan', instance.plan)
        instance.plan_session = validated_data.get('plan_session', instance.plan_session)
        instance.user = validated_data.get('user', instance.user)
        instance.status = validated_data.get('status', instance.status)

        instance.save()

        groups_data = None
        working_parameters_data = None
        
        if 'groups' in validated_data:
            groups_data = validated_data.pop('groups')

        if 'working_parameters' in validated_data:
            working_parameters_data = validated_data.pop('working_parameters')

        groups = WorkoutGroup.objects.filter(workout=instance)

        if groups_data is not None:
            new_data, updated_data, deleted_ids = get_differences(groups_data, groups.values())

            self.create_groups(instance, new_data)

            self.update_groups(updated_data)

            groups_to_delete = WorkoutGroup.objects.filter(id__in=deleted_ids)
            groups_to_delete.delete()
        else:
            groups.delete()

        working_parameters = WorkingParameter.objects.filter(workout=instance)

        if working_parameters_data is not None:
            new_data, updated_data, deleted_ids = get_differences(working_parameters_data, working_parameters.values())

            self.create_working_parameters(instance, new_data)

            self.update_working_parameters(updated_data)

            working_parameters_to_delete = WorkingParameter.objects.filter(id__in=deleted_ids)
            working_parameters_to_delete.delete()
        else:
            working_parameters.delete()

        return instance

    def update_working_parameters(self, working_parameters_data):
        for working_parameter_data in working_parameters_data:
            instances = WorkingParameter.objects.filter(pk=working_parameter_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            exercise = working_parameter_data.get('exercise')
            exercise_model = Exercise.objects.get(pk=exercise['id'])
            instance.exercise = exercise_model
            instance.weight = working_parameter_data.get('weight', instance.weight)
            instance.unit = working_parameter_data.get('unit', instance.unit)
            instance.previous_parameter_value = working_parameter_data.get('previous_parameter_value', instance.previous_parameter_value)
            instance.previous_unit = working_parameter_data.get('previous_unit', instance.previous_unit)
            instance.manually_changed = working_parameter_data.get('manually_changed', instance.manually_changed)
            instance.save()

    def update_groups(self, groups_data):
        for group_data in groups_data:
            sets_data = None
            warmups_data = None

            if 'sets' in group_data:
                sets_data = group_data.pop('sets')

            if 'warmups' in group_data:
                warmups_data = group_data.pop('warmups')

            instances = WorkoutGroup.objects.filter(pk=group_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.order = group_data.get('order', instance.order)
            instance.name = group_data.get('name', instance.name)
            instance.plan_session_group = group_data.get('plan_session_group', instance.plan_session_group)
            instance.save()

            sets = WorkoutSet.objects.filter(workout_group=instance)

            if sets_data is not None:
                new_data, updated_data, deleted_ids = get_differences(sets_data, sets.values())

                self.create_group_activities(WorkoutSet, instance, new_data)

                self.update_group_activities(WorkoutSet, updated_data)

                WorkoutSet.objects.filter(id__in=deleted_ids).delete()
            else:
                sets.delete()

            warmups = WorkoutWarmUp.objects.filter(workout_group=instance)

            if warmups_data is not None:
                new_data, updated_data, deleted_ids = get_differences(warmups_data, warmups.values())

                self.create_group_activities(WorkoutWarmUp, instance, new_data)

                self.update_group_activities(WorkoutWarmUp, updated_data)

                WorkoutWarmUp.objects.filter(id__in=deleted_ids).delete()
            else:
                warmups.delete()

    def update_group_activities(self, model, groups_data):
        for group_data in groups_data:
            instances = model.objects.filter(pk=group_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            exercise = group_data.get('exercise')
            exercise_model = Exercise.objects.get(pk=exercise['id'])

            instance.order = group_data.get('order', instance.order)
            instance.start = group_data.get('start', instance.start)
            instance.end = group_data.get('end', instance.end)
            instance.exercise = exercise_model
            instance.repetition_type = group_data.get('repetition_type', instance.repetition_type)
            instance.expected_number_of_repetitions = group_data.get('expected_number_of_repetitions', instance.expected_number_of_repetitions)
            instance.expected_number_of_repetitions_up_to = group_data.get('expected_number_of_repetitions_up_to', instance.expected_number_of_repetitions_up_to)
            instance.number_of_repetitions = group_data.get('number_of_repetitions', instance.number_of_repetitions)
            instance.weight = group_data.get('weight', instance.weight)
            instance.unit = group_data.get('unit', instance.unit)
            instance.done = group_data.get('done', instance.done)
            instance.in_progress = group_data.get('in_progress', instance.in_progress)
            instance.working_weight_percentage = group_data.get('working_weight_percentage', instance.working_weight_percentage)
            instance.plan_session_group_activity = group_data.get('plan_session_group_activity', instance.plan_session_group_activity)

            instance.speed_type = group_data.get('speed_type', instance.speed_type)
            instance.expected_speed = group_data.get('expected_speed', instance.expected_speed)
            instance.expected_speed_up_to = group_data.get('expected_speed_up_to', instance.expected_speed_up_to)
            instance.speed = group_data.get('speed', instance.speed)

            instance.vo2max_type = group_data.get('vo2max_type', instance.vo2max_type)
            instance.expected_vo2max = group_data.get('expected_vo2max', instance.expected_vo2max)
            instance.expected_vo2max_up_to = group_data.get('expected_vo2max_up_to', instance.expected_vo2max_up_to)
            instance.vo2max = group_data.get('vo2max', instance.vo2max)

            instance.distance_type = group_data.get('distance_type', instance.distance_type)
            instance.expected_distance = group_data.get('expected_distance', instance.expected_distance)
            instance.expected_distance_up_to = group_data.get('expected_distance_up_to', instance.expected_distance_up_to)
            instance.distance = group_data.get('distance', instance.distance)

            instance.time_type = group_data.get('time_type', instance.time_type)
            instance.expected_time = group_data.get('expected_time', instance.expected_time)
            instance.expected_time_up_to = group_data.get('expected_time_up_to', instance.expected_time_up_to)
            instance.time = group_data.get('time', instance.time)

            instance.working_distance_percentage = group_data.get('working_distance_percentage', instance.working_distance_percentage)
            instance.working_time_percentage = group_data.get('working_time_percentage', instance.working_time_percentage)
            instance.working_speed_percentage = group_data.get('working_speed_percentage', instance.working_speed_percentage)

            instance.speed_unit = group_data.get('speed_unit', instance.speed_unit)
            instance.distance_unit = group_data.get('distance_unit', instance.distance_unit)
            instance.time_unit = group_data.get('time_unit', instance.time_unit)

            instance.save()