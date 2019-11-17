from rest_framework import serializers
from .models import Workout, WorkoutSet, WorkoutWarmUp, WorkoutGroup
from .utils import get_differences

class WorkoutSetSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutSet()._meta.get_field('id'), required=False)
    class Meta:
        model = WorkoutSet
        fields = ['id', 'order', 'start', 'end', 'exercise', 'repetition_type', 'expected_number_of_repetitions', 'expected_number_of_repetitions_up_to', 'number_of_repetitions', 'weight', 'unit', 'done']

class WorkoutWarmUpSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutWarmUp()._meta.get_field('id'), required=False)
    class Meta:
        model = WorkoutWarmUp
        fields = ['id', 'order', 'start', 'end', 'exercise', 'repetition_type', 'expected_number_of_repetitions', 'expected_number_of_repetitions_up_to', 'number_of_repetitions', 'weight', 'unit', 'done']

class WorkoutGroupSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutGroup()._meta.get_field('id'), required=False)
    sets = WorkoutSetSerializer(many=True, required=False)
    warmups = WorkoutWarmUpSerializer(many=True, required=False)

    class Meta:
        model = WorkoutGroup
        fields = ['id', 'order', 'name', 'sets', 'warmups']

class WorkoutSerializer(serializers.ModelSerializer):
    groups = WorkoutGroupSerializer(many=True, required=False)

    class Meta:
        model = Workout
        fields = ['id', 'start', 'end', 'name', 'notes', 'plan', 'plan_session', 'user', 'groups']

    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        groups_data = None

        if 'groups' in validated_data:
            groups_data = validated_data.pop('groups')

        workout = Workout.objects.create(user=user, **validated_data)

        if groups_data is not None:
            self.create_groups(workout, groups_data)

        return workout

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
            model.objects.create(workout_group=workout_group, **activity_data)

    def update(self, instance, validated_data):
        instance.start = validated_data.get('start', instance.start)
        instance.end = validated_data.get('end', instance.end)
        instance.name = validated_data.get('name', instance.name)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.plan = validated_data.get('plan', instance.plan)
        instance.plan_session = validated_data.get('plan_session', instance.plan_session)
        instance.user = validated_data.get('user', instance.user)

        instance.save()

        groups_data = None
        
        if 'groups' in validated_data:
            groups_data = validated_data.pop('groups')

        groups = WorkoutGroup.objects.filter(workout=instance)

        if groups_data is not None:
            new_data, updated_data, deleted_ids = get_differences(groups_data, groups.values())

            self.create_groups(instance, new_data)

            self.update_groups(updated_data)

            groups_to_delete = WorkoutGroup.objects.filter(id__in=deleted_ids)
            groups_to_delete.delete()
        else:
            groups.delete()

        return instance

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

                self.create_group_activities(WorkoutWarmUp, instance, warmups_data)

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
            instance.order = group_data.get('order', instance.order)
            instance.start = group_data.get('start', instance.start)
            instance.end = group_data.get('end', instance.end)
            instance.exercise = group_data.get('exercise', instance.exercise)
            instance.repetition_type = group_data.get('repetition_type', instance.repetition_type)
            instance.expected_number_of_repetitions = group_data.get('expected_number_of_repetitions', instance.expected_number_of_repetitions)
            instance.expected_number_of_repetitions_up_to = group_data.get('expected_number_of_repetitions_up_to', instance.expected_number_of_repetitions_up_to)
            instance.number_of_repetitions = group_data.get('number_of_repetitions', instance.number_of_repetitions)
            instance.weight = group_data.get('weight', instance.weight)
            instance.unit = group_data.get('unit', instance.unit)
            instance.done = group_data.get('done', instance.done)
            instance.save()