from rest_framework import serializers
from workouts.models import Plan, PlanSession, PlanSessionGroup, PlanSessionGroupExercise, PlanSessionGroupWarmUp, PlanProgressionStrategy, PlanSessionProgressionStrategy, PlanSessionGroupProgressionStrategy, Exercise
from workouts.utils import get_differences
from workouts.serializers.serializers import ExerciseSerializer
from users.serializers import UserSerializer

class PlanSessionGroupExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroupExercise()._meta.get_field('id'), required=False)
    exercise = ExerciseSerializer()

    class Meta:
        model = PlanSessionGroupExercise
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'repetition_type', 'number_of_repetitions', 'number_of_repetitions_up_to', 'working_weight_percentage',
        'working_distance_percentage', 'working_speed_percentage', 'working_time_percentage', 'time_type',
        'time_up_to', 'time', 'distance_type', 'distance_up_to', 'distance', 'vo2max_type', 'vo2max_up_to', 'vo2max',
        'speed', 'speed_up_to', 'speed_type', 'time_unit', 'speed_unit', 'distance_unit']

class PlanSessionGroupWarmUpSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroupWarmUp()._meta.get_field('id'), required=False)
    exercise = ExerciseSerializer()

    class Meta:
        model = PlanSessionGroupExercise
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'repetition_type', 'number_of_repetitions', 'number_of_repetitions_up_to', 'working_weight_percentage',
        'working_distance_percentage', 'working_speed_percentage', 'working_time_percentage', 'time_type',
        'time_up_to', 'time', 'distance_type', 'distance_up_to', 'distance', 'vo2max_type', 'vo2max_up_to', 'vo2max',
        'speed', 'speed_up_to', 'speed_type', 'time_unit', 'speed_unit', 'distance_unit']

class PlanProgressionStrategySerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanProgressionStrategy()._meta.get_field('id'), required=False)
    exercise = ExerciseSerializer(required=False, allow_null=True)

    class Meta:
        model = PlanProgressionStrategy
        fields = ['id', 'exercise', 'initial_value', 'parameter_type', 'percentage_increase', 'parameter_increase', 'unit', 'mechanics', 'force', 'modality', 'section', 'progression_type']

class PlanSessionProgressionStrategySerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionProgressionStrategy()._meta.get_field('id'), required=False)
    exercise = ExerciseSerializer(required=False, allow_null=True)

    class Meta:
        model = PlanSessionProgressionStrategy
        fields = ['id', 'exercise', 'initial_value', 'parameter_type', 'percentage_increase', 'parameter_increase', 'unit', 'mechanics', 'force', 'modality', 'section', 'progression_type']

class PlanSessionGroupProgressionStrategySerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroupProgressionStrategy()._meta.get_field('id'), required=False)
    exercise = ExerciseSerializer(required=False, allow_null=True)

    class Meta:
        model = PlanSessionGroupProgressionStrategy
        fields = ['id', 'exercise', 'initial_value', 'parameter_type', 'percentage_increase', 'parameter_increase', 'unit', 'mechanics', 'force', 'modality', 'section', 'progression_type']

class PlanSessionGroupSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionGroup()._meta.get_field('id'), required=False)
    exercises = PlanSessionGroupExerciseSerializer(many=True, required=False)
    warmups = PlanSessionGroupWarmUpSerializer(many=True, required=False)
    progressions = PlanSessionGroupProgressionStrategySerializer(many=True, required=False)

    class Meta:
        model = PlanSessionGroup
        fields = ['id', 'order', 'name', 'exercises', 'warmups', 'progressions']

class PlanSessionSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSession()._meta.get_field('id'), required=False)
    groups = PlanSessionGroupSerializer(many=True, required=False)
    progressions = PlanSessionProgressionStrategySerializer(many=True, required=False)

    class Meta:
        model = PlanSession
        fields = ['id', 'name', 'groups', 'progressions']

class PlanSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    sessions = PlanSessionSerializer(many=True, required=False)
    progressions = PlanProgressionStrategySerializer(many=True, required=False)
    
    class Meta:
        model = Plan
        fields = ['id', 'short_name', 'name', 'description', 'creation', 'user', 'parent_plan', 'public', 'sessions', 'progressions', 'likes', 'comment_number']
        read_only_fields = ('likes','comment_number',)
        extra_kwargs = {'user': {'required': False}, 'creation': {'required': False}}

    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        sessions_data = None
        progressions_data = None

        if 'sessions' in validated_data:
            sessions_data = validated_data.pop('sessions')

        if 'progressions' in validated_data:
            progressions_data = validated_data.pop('progressions')

        plan = Plan.objects.create(user=user, **validated_data)

        if sessions_data is not None:
            self.create_sessions(plan, sessions_data)

        if progressions_data is not None:
            self.create_plan_progressions(progressions_data, plan)

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
                self.create_plan_session_progressions(progressions_data, plan_session)

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
                self.create_plan_session_group_progressions(progressions_data, plan_session_group)

    def create_plan_progressions(self, progressions_data, plan):
        for progression_data in progressions_data:
            exercise_model = None
            if 'exercise' in progression_data:
                exercise = progression_data.pop('exercise')
                if exercise is not None:
                    exercise_model = Exercise.objects.get(pk=exercise['id'])

            PlanProgressionStrategy.objects.create(plan=plan, exercise=exercise_model, **progression_data)    

    def create_plan_session_progressions(self, progressions_data, plan_session):
        for progression_data in progressions_data:
            exercise_model = None
            if 'exercise' in progression_data:
                exercise = progression_data.pop('exercise')
                if exercise is not None:
                    exercise_model = Exercise.objects.get(pk=exercise['id'])
            PlanSessionProgressionStrategy.objects.create(plan_session=plan_session, exercise=exercise_model, **progression_data)    

    def create_plan_session_group_progressions(self, progressions_data, plan_session_group):
        for progression_data in progressions_data:
            exercise_model = None
            if 'exercise' in progression_data:
                exercise = progression_data.pop('exercise')
                if exercise is not None:
                    exercise_model = Exercise.objects.get(pk=exercise['id'])
            PlanSessionGroupProgressionStrategy.objects.create(plan_session_group=plan_session_group, exercise=exercise_model, **progression_data)    

    def create_group_activities(self, model, plan_session_group, exercises_data):
        if exercises_data is not None:
            for exercise_data in exercises_data:
                exercise_model = None
                if 'exercise' in exercise_data:
                    exercise = exercise_data.pop('exercise')
                    if exercise is not None:
                        exercise_model = Exercise.objects.get(pk=exercise['id'])
                model.objects.create(plan_session_group=plan_session_group, exercise=exercise_model, **exercise_data)

    def update_group_activities(self, model, exercises_data):
        for exercise_data in exercises_data:
            instances = model.objects.filter(pk=exercise_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            exercise_model = None
            if 'exercise' in exercise_data:
                exercise = exercise_data.pop('exercise')
                exercise_model = Exercise.objects.get(pk=exercise['id'])
            instance.exercise = exercise_model
            instance.order = exercise_data.get('order', instance.order)
            instance.repetition_type = exercise_data.get('repetition_type', instance.repetition_type)
            instance.number_of_sets = exercise_data.get('number_of_sets', instance.number_of_sets)
            instance.number_of_repetitions = exercise_data.get('number_of_repetitions', instance.number_of_repetitions)
            instance.number_of_repetitions_up_to = exercise_data.get('number_of_repetitions_up_to', instance.number_of_repetitions_up_to)
            instance.working_weight_percentage = exercise_data.get('working_weight_percentage', instance.working_weight_percentage)
            instance.working_distance_percentage = exercise_data.get('working_distance_percentage', instance.working_distance_percentage)
            instance.working_time_percentage = exercise_data.get('working_time_percentage', instance.working_time_percentage)
            instance.working_speed_percentage = exercise_data.get('working_speed_percentage', instance.working_speed_percentage)
            instance.time_type = exercise_data.get('time_type', instance.time_type)
            instance.time_up_to = exercise_data.get('time_up_to', instance.time_up_to)
            instance.time = exercise_data.get('time', instance.time)
            instance.time_unit = exercise_data.get('time_unit', instance.time_unit)
            instance.distance_type = exercise_data.get('distance_type', instance.distance_type)
            instance.distance_up_to = exercise_data.get('distance_up_to', instance.distance_up_to)
            instance.distance = exercise_data.get('distance', instance.distance)
            instance.distance_unit = exercise_data.get('distance_unit', instance.distance_unit)
            instance.vo2max_up_to = exercise_data.get('vo2max_up_to', instance.vo2max_up_to)
            instance.vo2max_type = exercise_data.get('vo2max_type', instance.vo2max_type)
            instance.vo2max = exercise_data.get('vo2max', instance.vo2max)
            instance.speed_up_to = exercise_data.get('speed_up_to', instance.speed_up_to)
            instance.speed = exercise_data.get('speed', instance.speed)
            instance.speed_type = exercise_data.get('speed_type', instance.speed_type)
            instance.speed_unit = exercise_data.get('speed_unit', instance.speed_unit)

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
                new_data, updated_data, deleted_ids = get_differences(groups_data, groups.values())

                self.create_groups(instance, new_data)

                self.update_groups(updated_data)

                groups_to_delete = PlanSessionGroup.objects.filter(id__in=deleted_ids)
                groups_to_delete.delete()
            else:
                groups.delete()

            self.update_progressions_set(session_data, PlanSessionProgressionStrategy, plan_session=instance)

    def update_progressions(self, progressions_data, model):
        for progression_data in progressions_data:
            instances = model.objects.filter(pk=progression_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            exercise_model = None
            if 'exercise' in progression_data:
                exercise = progression_data.pop('exercise')
                if exercise is not None:
                    exercise_model = Exercise.objects.get(pk=exercise['id'])

            instance.exercise = exercise_model
            instance.parameter_type = progression_data.get('parameter_type', instance.parameter_type)
            instance.percentage_increase = progression_data.get('percentage_increase', instance.percentage_increase)
            instance.parameter_increase = progression_data.get('parameter_increase', instance.parameter_increase)
            instance.initial_value = progression_data.get('initial_value', instance.initial_value)
            instance.unit = progression_data.get('unit', instance.unit)
            instance.mechanics = progression_data.get('mechanics', instance.mechanics)
            instance.force = progression_data.get('force', instance.force)
            instance.modality = progression_data.get('modality', instance.modality)
            instance.section = progression_data.get('section', instance.section)
            instance.progression_type = progression_data.get('progression_type', instance.progression_type)
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

            self.update_progressions_set(group_data, PlanSessionGroupProgressionStrategy, plan_session_group=instance)

    def update_group_activity_set(self, model, plan_session_group, exercises_data):
        exercises = model.objects.filter(plan_session_group=plan_session_group)

        if exercises_data is not None:
            new_data, updated_data, deleted_ids = get_differences(exercises_data, exercises.values())

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
        instance.parent_plan = validated_data.get('parent_plan', instance.parent_plan)
        instance.public = validated_data.get('public', instance.public)
        instance.save()

        sessions_data = None

        if 'sessions' in validated_data:
            sessions_data = validated_data.pop('sessions')

        sessions = PlanSession.objects.filter(plan=instance)

        if sessions_data is not None:
            new_data, updated_data, deleted_ids = get_differences(sessions_data, sessions.values())

            self.create_sessions(instance, new_data)

            self.update_sessions(updated_data)

            sessions_to_delete = PlanSession.objects.filter(id__in=deleted_ids)
            sessions_to_delete.delete()
        else:
            sessions.delete()

        self.update_progressions_set(validated_data, PlanProgressionStrategy, plan=instance)

        return instance

    def update_progressions_set(self, validated_data, model, plan=None, plan_session=None, plan_session_group=None):
        progressions_data = None

        if 'progressions' in validated_data:
            progressions_data = validated_data.pop('progressions')

        if plan is not None:
            progressions = model.objects.filter(plan=plan)

        if plan_session is not None:
            progressions = model.objects.filter(plan_session=plan_session)

        if plan_session_group is not None:
            progressions = model.objects.filter(plan_session_group=plan_session_group)

        if progressions_data is not None:
            new_data, updated_data, deleted_ids = get_differences(progressions_data, progressions.values())

            if plan is not None:
                self.create_plan_progressions(new_data, plan)

            if plan_session is not None:
                self.create_plan_session_progressions(new_data, plan_session)

            if plan_session_group is not None:
                self.create_plan_session_group_progressions(new_data, plan_session_group)

            self.update_progressions(updated_data, model)

            progressions_to_delete = model.objects.filter(id__in=deleted_ids)
            progressions_to_delete.delete()
        else:
            progressions.delete()
