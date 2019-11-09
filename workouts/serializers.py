from rest_framework import serializers
from .models import Exercise, Plan, PlanSession, PlanSessionGroup, PlanSessionGroupExercise, Unit, UnitConversion, Workout, WorkoutSet

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

class WorkoutSetSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=WorkoutSet()._meta.get_field('id'), required=False)
    class Meta:
        model = WorkoutSet
        fields = ['id', 'start', 'end', 'exercise', 'number_of_repetitions', 'weight', 'unit']

class WorkoutSerializer(serializers.ModelSerializer):
    # todo: define create and update methods
    sets = WorkoutSetSerializer(many=True, required=False)
    class Meta:
        model = Workout
        fields = ['id', 'start', 'end', 'plan_session', 'user', 'sets']

class PlanSessionGroupExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroupExercise()._meta.get_field('id'), required=False)
    class Meta:
        model = PlanSessionGroupExercise
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'number_of_repetitions', 'number_of_repetitions_up_to', 'working_weight_percentage', 'is_warmup']

class PlanSessionGroupSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroup()._meta.get_field('id'), required=False)
    exercises = PlanSessionGroupExerciseSerializer(many=True, required=False)

    class Meta:
        model = PlanSessionGroup
        fields = ['id', 'order', 'name', 'exercises']

class PlanSessionSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSession()._meta.get_field('id'), required=False)
    groups = PlanSessionGroupSerializer(many=True, required=False)

    class Meta:
        model = PlanSession
        fields = ['id', 'name', 'groups']

class PlanSerializer(serializers.ModelSerializer):
    # todo: set owner on create and update
    sessions = PlanSessionSerializer(many=True, required=False)
    
    class Meta:
        model = Plan
        fields = ['id', 'short_name', 'name', 'description', 'owner', 'sessions']

    def create(self, validated_data):
        sessions_data = None
        if 'sessions' in validated_data:
            sessions_data = validated_data.pop('sessions')

        plan = Plan.objects.create(**validated_data)

        if sessions_data is not None:
            self.create_sessions(plan, sessions_data)

        return plan

    def create_sessions(self, plan, sessions_data):
        for session_data in sessions_data:
            groups_data = None

            if 'groups' in session_data:
                groups_data = session_data.pop('groups')

            plan_session = PlanSession.objects.create(plan=plan, **session_data)

            self.create_groups(plan_session, groups_data)

    def create_groups(self, plan_session, groups_data):
        for group_data in groups_data:
            exercises_data = None

            if 'exercises' in group_data:
                exercises_data = group_data.pop('exercises')

            plan_session_group = PlanSessionGroup.objects.create(plan_session=plan_session, **group_data)

            self.create_exercises(plan_session_group, exercises_data)

    def create_exercises(self, plan_session_group, exercises_data):
        if exercises_data is not None:
            for exercise_data in exercises_data:
                PlanSessionGroupExercise.objects.create(plan_session_group=plan_session_group, **exercise_data)

    def update_exercises(self, exercises_data):
        for exercise_data in exercises_data:
            instances = PlanSessionGroupExercise.objects.filter(pk=exercise_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            instance.order = exercise_data.get('order', instance.order)
            instance.exercise = exercise_data.get('exercise', instance.exercise)
            instance.number_of_sets = exercise_data.get('number_of_sets', instance.number_of_sets)
            instance.number_of_repetitions = exercise_data.get('number_of_repetitions', instance.number_of_repetitions)
            instance.number_of_repetitions_up_to = exercise_data.get('number_of_repetitions_up_to', instance.number_of_repetitions_up_to)
            instance.working_weight_percentage = exercise_data.get('working_weight_percentage', instance.working_weight_percentage)
            instance.is_warmup = exercise_data.get('is_warmup', instance.is_warmup)

            instance.save()

    def update_sessions(self, sessions_data):
        for session_data in sessions_data:
            groups_data = None

            if 'groups' in session_data:
                groups_data = session_data.pop('groups')

            instances = PlanSession.objects.filter(pk=session_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.name = session_data.get('name', instance.name)
            instance.save()

            groups = PlanSessionGroup.objects.filter(plan_session=instance)

            if groups_data is not None:
                new_groups_data = [x for x in groups_data if 'id' not in x or ('id' in x and (x['id'] is None or x['id'] <= 0))]
                updated_groups_data = [x for x in groups_data if 'id' in x and x['id'] > 0]
                deleted_groups_ids = [z['id'] for z in [x for x in groups.values() if 'id' in x and x['id'] not in [y['id'] for y in updated_groups_data]]]

                self.create_groups(instance, new_groups_data)

                self.update_groups(updated_groups_data)

                groups_to_delete = PlanSessionGroup.objects.filter(id__in=deleted_groups_ids)
                groups_to_delete.delete()
            else:
                groups.delete()

    def update_groups(self, groups_data):
        for group_data in groups_data:
            exercises_data = None

            if 'exercises' in group_data:
                exercises_data = group_data.pop('exercises')

            instances = PlanSessionGroup.objects.filter(pk=group_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.name = group_data.get('name', instance.name)
            instance.order = group_data.get('order', instance.order)
            instance.save()

            exercises = PlanSessionGroupExercise.objects.filter(plan_session_group=instance)

            if exercises_data is not None:
                new_exercises_data = [x for x in exercises_data if 'id' not in x or ('id' in x and (x['id'] is None or x['id'] <= 0))]
                updated_exercises_data = [x for x in exercises_data if 'id' in x and x['id'] > 0]
                deleted_exercises_ids = [z['id'] for z in [x for x in exercises.values() if 'id' in x and x['id'] not in [y['id'] for y in updated_exercises_data]]]

                self.create_exercises(instance, new_exercises_data)

                self.update_exercises(updated_exercises_data)

                exercises_to_delete = PlanSessionGroupExercise.objects.filter(id__in=deleted_exercises_ids)
                exercises_to_delete.delete()
            else:
                exercises.delete()

    def update(self, instance, validated_data):
        # update the plan first
        instance.short_name = validated_data.get('short_name', instance.short_name)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        sessions_data = None

        if 'sessions' in validated_data:
            sessions_data = validated_data.pop('sessions')

        sessions = PlanSession.objects.filter(plan=instance)

        if sessions_data is not None:
            new_sessions_data = [x for x in sessions_data if 'id' not in x or ('id' in x and (x['id'] is None or x['id'] <= 0))]
            updated_sessions_data = [x for x in sessions_data if 'id' in x and x['id'] > 0]
            deleted_sessions_ids = [z['id'] for z in [x for x in sessions.values() if 'id' in x and x['id'] not in [y['id'] for y in updated_sessions_data]]]

            self.create_sessions(instance, new_sessions_data)

            self.update_sessions(updated_sessions_data)

            sessions_to_delete = PlanSession.objects.filter(id__in=deleted_sessions_ids)
            sessions_to_delete.delete()
        else:
            sessions.delete()

        return instance