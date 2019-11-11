from rest_framework import serializers
from .models import Exercise, Plan, PlanSession, PlanSessionGroup, PlanSessionGroupExercise, PlanSessionGroupWarmUp, PlanProgressionStrategy, Unit, UnitConversion, Workout, WorkoutSet
from pprint import pprint

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
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'number_of_repetitions', 'number_of_repetitions_up_to', 'working_weight_percentage']

class PlanSessionGroupWarmUpSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroupWarmUp()._meta.get_field('id'), required=False)
    class Meta:
        model = PlanSessionGroupExercise
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'number_of_repetitions', 'number_of_repetitions_up_to', 'working_weight_percentage']

class PlanProgressionStrategySerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSession()._meta.get_field('id'), required=False)

    class Meta:
        model = PlanProgressionStrategy
        fields = ['id', 'exercise', 'percentage_increase', 'weight_increase', 'unit', 'mechanics', 'force', 'modality', 'section']

class PlanSessionGroupSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroup()._meta.get_field('id'), required=False)
    exercises = PlanSessionGroupExerciseSerializer(many=True, required=False)
    warmups = PlanSessionGroupWarmUpSerializer(many=True, required=False)
    progressions = PlanProgressionStrategySerializer(many=True, required=False)

    class Meta:
        model = PlanSessionGroup
        fields = ['id', 'order', 'name', 'exercises', 'warmups', 'progressions']

class PlanSessionSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSession()._meta.get_field('id'), required=False)
    groups = PlanSessionGroupSerializer(many=True, required=False)
    progressions = PlanProgressionStrategySerializer(many=True, required=False)

    class Meta:
        model = PlanSession
        fields = ['id', 'name', 'groups', 'progressions']

class PlanSerializer(serializers.ModelSerializer):
    # todo: set owner on create and update
    sessions = PlanSessionSerializer(many=True, required=False)
    progressions = PlanProgressionStrategySerializer(many=True, required=False)
    
    class Meta:
        model = Plan
        fields = ['id', 'short_name', 'name', 'description', 'owner', 'sessions', 'progressions']

    def create(self, validated_data):
        sessions_data = None
        progressions_data = None

        if 'sessions' in validated_data:
            sessions_data = validated_data.pop('sessions')

        if 'progressions' in validated_data:
            progressions_data = validated_data.pop('progressions')

        plan = Plan.objects.create(**validated_data)

        if sessions_data is not None:
            self.create_sessions(plan, sessions_data)

        if progressions_data is not None:
            self.create_progressions(progressions_data, plan)

        return plan

    def create_sessions(self, plan, sessions_data):
        for session_data in sessions_data:
            groups_data = None
            progressions_data = None

            if 'groups' in session_data:
                groups_data = session_data.pop('groups')

            if 'progressions' in session_data:
                progressions_data = session_data.pop('progressions')

            plan_session = PlanSession.objects.create(plan=plan, **session_data)

            if groups_data is not None:
                self.create_groups(plan_session, groups_data)

            if progressions_data is not None:
                self.create_progressions(progressions_data, plan, plan_session)

    def create_groups(self, plan_session, groups_data):
        for group_data in groups_data:
            exercises_data = None
            warmups_data = None
            progressions_data = None

            if 'exercises' in group_data:
                exercises_data = group_data.pop('exercises')

            if 'warmups' in group_data:
                warmups_data = group_data.pop('warmups')

            if 'progressions' in group_data:
                progressions_data = group_data.pop('progressions')

            plan_session_group = PlanSessionGroup.objects.create(plan_session=plan_session, **group_data)

            if exercises_data is not None:
                self.create_group_activities(PlanSessionGroupExercise, plan_session_group, exercises_data)

            if warmups_data is not None:
                self.create_group_activities(PlanSessionGroupWarmUp, plan_session_group, warmups_data)

            if progressions_data is not None:
                self.create_progressions(progressions_data, plan_session.plan, plan_session, plan_session_group)

    def create_progressions(self, progressions_data, plan, plan_session=None, plan_session_group=None):
        for progression_data in progressions_data:
            PlanProgressionStrategy.objects.create(plan=plan, plan_session=plan_session, plan_session_group=plan_session_group, **progression_data)    

    def create_group_activities(self, model, plan_session_group, exercises_data):
        if exercises_data is not None:
            for exercise_data in exercises_data:
                model.objects.create(plan_session_group=plan_session_group, **exercise_data)

    def update_group_activities(self, model, exercises_data):
        for exercise_data in exercises_data:
            instances = model.objects.filter(pk=exercise_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            instance.order = exercise_data.get('order', instance.order)
            instance.exercise = exercise_data.get('exercise', instance.exercise)
            instance.number_of_sets = exercise_data.get('number_of_sets', instance.number_of_sets)
            instance.number_of_repetitions = exercise_data.get('number_of_repetitions', instance.number_of_repetitions)
            instance.number_of_repetitions_up_to = exercise_data.get('number_of_repetitions_up_to', instance.number_of_repetitions_up_to)
            instance.working_weight_percentage = exercise_data.get('working_weight_percentage', instance.working_weight_percentage)

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
                new_data, updated_data, deleted_ids = self.get_differences(groups_data, groups.values())

                self.create_groups(instance, new_data)

                self.update_groups(updated_data)

                groups_to_delete = PlanSessionGroup.objects.filter(id__in=deleted_ids)
                groups_to_delete.delete()
            else:
                groups.delete()

            self.update_progressions_set(session_data, instance.plan, instance)

    def update_progressions(self, progressions_data):
        for progression_data in progressions_data:
            instances = PlanProgressionStrategy.objects.filter(pk=progression_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.exercise = progression_data.get('exercise', instance.exercise)
            instance.percentage_increase = progression_data.get('percentage_increase', instance.percentage_increase)
            instance.weight_increase = progression_data.get('weight_increase', instance.weight_increase)
            instance.unit = progression_data.get('unit', instance.unit)
            instance.mechanics = progression_data.get('mechanics', instance.mechanics)
            instance.force = progression_data.get('force', instance.force)
            instance.modality = progression_data.get('modality', instance.modality)
            instance.section = progression_data.get('section', instance.section)
            instance.save()

    def update_groups(self, groups_data):
        for group_data in groups_data:
            exercises_data = None
            warmups_data = None

            if 'exercises' in group_data:
                exercises_data = group_data.pop('exercises')

            if 'warmups' in group_data:
                warmups_data = group_data.pop('warmups')

            instances = PlanSessionGroup.objects.filter(pk=group_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.name = group_data.get('name', instance.name)
            instance.order = group_data.get('order', instance.order)
            instance.save()

            self.update_group_activity_set(PlanSessionGroupExercise, instance, exercises_data)
            self.update_group_activity_set(PlanSessionGroupWarmUp, instance, warmups_data)

            self.update_progressions_set(group_data, instance.plan_session.plan, instance.plan_session, instance)

    def update_group_activity_set(self, model, plan_session_group, exercises_data):
        exercises = model.objects.filter(plan_session_group=plan_session_group)

        if exercises_data is not None:
            new_data, updated_data, deleted_ids = self.get_differences(exercises_data, exercises.values())

            self.create_group_activities(model, plan_session_group, new_data)

            self.update_group_activities(model, updated_data)

            exercises_to_delete = model.objects.filter(id__in=deleted_ids)
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
            new_data, updated_data, deleted_ids = self.get_differences(sessions_data, sessions.values())

            self.create_sessions(instance, new_data)

            self.update_sessions(updated_data)

            sessions_to_delete = PlanSession.objects.filter(id__in=deleted_ids)
            sessions_to_delete.delete()
        else:
            sessions.delete()

        self.update_progressions_set(validated_data, instance)

        return instance

    def update_progressions_set(self, validated_data, plan, plan_session=None, plan_session_group=None):
        progressions_data = None

        if 'progressions' in validated_data:
            progressions_data = validated_data.pop('progressions')

        progressions = PlanProgressionStrategy.objects.filter(plan=plan)

        if plan_session is None:
            progressions = progressions.filter(plan_session__isnull=True)
        else:
            progressions = progressions.filter(plan_session=plan_session)

        if plan_session_group is None:
            progressions = progressions.filter(plan_session_group__isnull=True)
        else:
            progressions = progressions.filter(plan_session_group=plan_session_group)

        if progressions_data is not None:
            new_data, updated_data, deleted_ids = self.get_differences(progressions_data, progressions.values())

            pprint(plan)
            pprint(plan_session)
            pprint(plan_session_group)
            pprint(new_data)
            pprint(updated_data)
            pprint(deleted_ids)

            self.create_progressions(new_data, plan, plan_session, plan_session_group)

            self.update_progressions(updated_data)

            progressions_to_delete = PlanProgressionStrategy.objects.filter(id__in=deleted_ids)
            progressions_to_delete.delete()
        else:
            progressions.delete()

    def get_differences(self, data, existing_values):
        new_data = [x for x in data if 'id' not in x or ('id' in x and (x['id'] is None or x['id'] <= 0))]
        updated_data = [x for x in data if 'id' in x and x['id'] > 0]
        deleted_ids = [z['id'] for z in [x for x in existing_values if 'id' in x and x['id'] not in [y['id'] for y in updated_data]]]

        return new_data, updated_data, deleted_ids
