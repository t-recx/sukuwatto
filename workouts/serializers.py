from rest_framework import serializers
from .models import Exercise, Plan, PlanSession, PlanSessionExercise, Unit, UnitConversion, Workout, WorkoutSet

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

class PlanSessionExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSessionExercise()._meta.get_field('id'), required=False)
    class Meta:
        model = PlanSessionExercise
        fields = ['id', 'order', 'exercise', 'number_of_sets', 'number_of_repetitions', 'number_of_repetitions_up_to']

class PlanSessionSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PlanSession()._meta.get_field('id'), required=False)
    exercises = PlanSessionExerciseSerializer(many=True, required=False)

    class Meta:
        model = PlanSession
        fields = ['id', 'name', 'exercises']

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
            exercises_data = None

            if 'exercises' in session_data:
                exercises_data = session_data.pop('exercises')

            plan_session = PlanSession.objects.create(plan=plan, **session_data)

            self.create_exercises(plan_session, exercises_data)


    def create_exercises(self, plan_session, exercises_data):
        if exercises_data is not None:
            for exercise_data in exercises_data:
                PlanSessionExercise.objects.create(plan_session=plan_session, **exercise_data)

    def update_exercises(self, exercises_data):
        for exercise_data in exercises_data:
            instances = PlanSessionExercise.objects.filter(pk=exercise_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            instance.order = exercise_data.get('order', instance.order)
            instance.exercise = exercise_data.get('exercise', instance.exercise)
            instance.number_of_sets = exercise_data.get('number_of_sets', instance.number_of_sets)
            instance.number_of_repetitions = exercise_data.get('number_of_repetitions', instance.number_of_repetitions)
            instance.number_of_repetitions_up_to = exercise_data.get('number_of_repetitions_up_to', instance.number_of_repetitions_up_to)

            instance.save()

    def update_sessions(self, sessions_data):
        for session_data in sessions_data:
            exercises_data = None

            if 'exercises' in session_data:
                exercises_data = session_data.pop('exercises')

            instances = PlanSession.objects.filter(pk=session_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()
            instance.name = session_data.get('name', instance.name)
            instance.save()

            exercises = PlanSessionExercise.objects.filter(plan_session=instance)

            if exercises_data is not None:
                new_exercises_data = [x for x in exercises_data if 'id' not in x or ('id' in x and (x['id'] is None or x['id'] <= 0))]
                updated_exercises_data = [x for x in exercises_data if 'id' in x and x['id'] > 0]
                deleted_exercises_ids = [z['id'] for z in [x for x in exercises.values() if 'id' in x and x['id'] not in [y['id'] for y in updated_exercises_data]]]

                self.create_exercises(instance, new_exercises_data)

                self.update_exercises(updated_exercises_data)

                exercises_to_delete = PlanSessionExercise.objects.filter(id__in=deleted_exercises_ids)
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