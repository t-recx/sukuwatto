from rest_framework import serializers
from social.serializers import UserSerializer
from workouts.models import Workout, WorkoutSet, WorkoutWarmUp, WorkoutGroup, WorkingWeight, Exercise
from workouts.utils import get_differences
from workouts.serializers.serializers import ExerciseSerializer
from pprint import pprint
from django.contrib.auth import get_user_model

class WorkingWeightSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkingWeight()._meta.get_field('id'), required=False)
    class Meta:
        model = WorkingWeight
        fields = ['id', 'exercise', 'weight', 'unit', 'previous_weight', 'previous_unit']

class WorkoutSetSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()
    id = serializers.ModelField(model_field=WorkoutSet()._meta.get_field('id'), required=False)

    class Meta:
        model = WorkoutSet
        fields = ['id', 'order', 'start', 'end', 'exercise', 'repetition_type', 'expected_number_of_repetitions', 'expected_number_of_repetitions_up_to', 'number_of_repetitions', 'weight', 'unit', 'done', 'plan_session_group_activity', 'working_weight_percentage', 'in_progress']

class WorkoutWarmUpSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer()
    id = serializers.ModelField(model_field=WorkoutWarmUp()._meta.get_field('id'), required=False)

    class Meta:
        model = WorkoutWarmUp
        fields = ['id', 'order', 'start', 'end', 'exercise', 'repetition_type', 'expected_number_of_repetitions', 'expected_number_of_repetitions_up_to', 'number_of_repetitions', 'weight', 'unit', 'done', 'plan_session_group_activity', 'working_weight_percentage', 'in_progress']

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
    working_weights = WorkingWeightSerializer(many=True, required=False)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Workout
        fields = ['id', 'start', 'end', 'name', 'notes', 'plan', 'plan_session', 'groups', 'working_weights', 'user', 'status']
        extra_kwargs = {'user': {'required': False}}


    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        #todo: handle user null here...

        groups_data = None
        working_weights_data = None

        if 'groups' in validated_data:
            groups_data = validated_data.pop('groups')

        if 'working_weights' in validated_data:
            working_weights_data = validated_data.pop('working_weights')

        workout = Workout.objects.create(user=user, **validated_data)

        if groups_data is not None:
            self.create_groups(workout, groups_data)

        if working_weights_data is not None:
            self.create_working_weights(workout, working_weights_data)

        return workout

    def create_working_weights(self, workout, working_weights_data):
        for working_weight_data in working_weights_data:
            WorkingWeight.objects.create(workout=workout, **working_weight_data)

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
            # todo: check here if id exists??
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
        working_weights_data = None
        
        if 'groups' in validated_data:
            groups_data = validated_data.pop('groups')

        if 'working_weights' in validated_data:
            working_weights_data = validated_data.pop('working_weights')

        groups = WorkoutGroup.objects.filter(workout=instance)

        if groups_data is not None:
            new_data, updated_data, deleted_ids = get_differences(groups_data, groups.values())

            self.create_groups(instance, new_data)

            self.update_groups(updated_data)

            groups_to_delete = WorkoutGroup.objects.filter(id__in=deleted_ids)
            groups_to_delete.delete()
        else:
            groups.delete()

        working_weights = WorkingWeight.objects.filter(workout=instance)

        if working_weights_data is not None:
            new_data, updated_data, deleted_ids = get_differences(working_weights_data, working_weights.values())

            self.create_working_weights(instance, new_data)

            self.update_working_weights(updated_data)

            working_weights_to_delete = WorkingWeight.objects.filter(id__in=deleted_ids)
            working_weights_to_delete.delete()
        else:
            working_weights.delete()

        return instance

    def update_working_weights(self, working_weights_data):
        for working_weight_data in working_weights_data:
            instances = WorkingWeight.objects.filter(pk=working_weight_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.exercise = working_weight_data.get('exercise', instance.exercise)
            instance.weight = working_weight_data.get('weight', instance.weight)
            instance.unit = working_weight_data.get('unit', instance.unit)
            instance.previous_weight = working_weight_data.get('previous_weight', instance.previous_weight)
            instance.previous_unit = working_weight_data.get('previous_unit', instance.previous_unit)
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

            # todo: check here if id exists??
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
            instance.save()