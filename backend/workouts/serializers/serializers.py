from django.contrib.auth.models import AnonymousUser
from pprint import pprint
from rest_framework import serializers
from workouts.models import Exercise, Muscle, MuscleExercise, Unit, UserBioData, MetabolicEquivalentTask, UserSkill, Skill, WeeklyLeaderboardPosition, YearlyLeaderboardPosition, MonthlyLeaderboardPosition, AllTimeLeaderboardPosition
from workouts.exercise_service import ExerciseService
from users.serializers import UserSerializer
from workouts.utils import get_differences

class WeeklyLeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = WeeklyLeaderboardPosition
        fields = ['id', 'user', 'experience', 'rank']

class MonthlyLeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MonthlyLeaderboardPosition
        fields = ['id', 'user', 'experience', 'rank']

class YearlyLeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = YearlyLeaderboardPosition
        fields = ['id', 'user', 'experience', 'rank']

class AllTimeLeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AllTimeLeaderboardPosition
        fields = ['id', 'user', 'experience', 'rank']

class MetabolicEquivalentTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetabolicEquivalentTask
        fields = ['id', 'exercise', 'code', 'description', 'met', 'from_value', 'to_value', 'unit',
            'exercise_type', 'mechanics', 'force', 'modality', 'section', 'can_be_automatically_selected']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'class_name']

class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(required=False)

    class Meta:
        model = UserSkill
        fields = ['id', 'experience', 'level', 'skill', 'user']

class MuscleSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=Muscle()._meta.get_field('id'), required=False)

    class Meta:
        model = Muscle
        fields = ['id', 'name', 'description']

class MuscleExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=MuscleExercise()._meta.get_field('id'), required=False)
    muscle = MuscleSerializer(required=False)

    class Meta:
        model = MuscleExercise
        fields = ['id', 'muscle', 'role']

class ExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=Exercise()._meta.get_field('id'), required=False)
    user = UserSerializer(read_only=True)
    muscles = MuscleExerciseSerializer(many=True, required=False)

    class Meta:
        model = Exercise
        fields = ['id', 'exercise_type', 'short_name', 'name', 'description', 'mechanics', 'force', 'modality', 'section', 'level', 'creation', 'user', 'likes', 'comment_number', 'muscles']
        read_only_fields = ('likes','comment_number',)
        extra_kwargs = {'user': {'required': False}, 'creation': {'required': False}}

    def create(self, validated_data):
        muscles_data = None

        if 'muscles' in validated_data:
            muscles_data = validated_data.pop('muscles')

        exercise = Exercise.objects.create(user=self.context.get("request").user, **validated_data)

        if muscles_data is not None:
            self.create_muscles(exercise, muscles_data)

        return exercise

    def create_muscles(self, exercise, muscles_data):
        for muscle_data in muscles_data:
            muscle = muscle_data.pop('muscle')
            muscle_model = Muscle.objects.get(pk=muscle['id'])
            MuscleExercise.objects.create(exercise=exercise, muscle=muscle_model, 
                **muscle_data)

    def update_muscles(self, muscles_data):
        for muscle_data in muscles_data:
            instances = MuscleExercise.objects.filter(pk=muscle_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            muscle = muscle_data.get('muscle')
            muscle_model = Muscle.objects.get(pk=muscle['id'])
            instance.muscle = muscle_model
            instance.role = muscle_data.get('role', instance.role)
            instance.save()

    def update(self, instance, validated_data):
        es = ExerciseService()

        if es.in_use_on_other_users_resources(instance.id, self.context.get("request").user):
            raise serializers.ValidationError("Exercise in usage")

        instance.exercise_type = validated_data.get('exercise_type', instance.exercise_type)
        instance.short_name = validated_data.get('short_name', instance.short_name)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.mechanics = validated_data.get('mechanics', instance.mechanics)
        instance.force = validated_data.get('force', instance.force)
        instance.modality = validated_data.get('modality', instance.modality)
        instance.section = validated_data.get('section', instance.section)
        instance.level = validated_data.get('level', instance.level)

        instance.save()

        muscles_data = None
        
        if 'muscles' in validated_data:
            muscles_data = validated_data.pop('muscles')

        muscles = MuscleExercise.objects.filter(exercise=instance)

        if muscles_data is not None:
            new_data, updated_data, deleted_ids = get_differences(muscles_data, muscles.values())

            self.create_muscles(instance, new_data)

            self.update_muscles(updated_data)

            muscles_to_delete = MuscleExercise.objects.filter(id__in=deleted_ids)
            muscles_to_delete.delete()
        else:
            muscles.delete()

        return instance

class UserBioDataSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserBioData
        fields = ['id', 'date', 'weight', 'weight_unit', 'height', 'height_unit', 
            'body_fat_percentage', 'water_weight_percentage', 'muscle_mass_percentage',
            'bone_mass_weight', 'bone_mass_weight_unit', 'notes', 'user', 'creation',
            'likes','comment_number', 'visibility']
        read_only_fields = ('likes','comment_number',)
        extra_kwargs = {'user': {'required': False}, 'creation': {'required': False}}

    def validate_date(self, value):
        if value is None:
            raise serializers.ValidationError("Date is required")

        return value

    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        instance = UserBioData.objects.create(user=user, **validated_data)

        existing_records = UserBioData.objects.filter(user=user, date=instance.date).exclude(id=instance.id)
        existing_records.delete()

        return instance

    def update(self, instance, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        instance.date = validated_data.get('date', instance.date)
        instance.weight = validated_data.get('weight', instance.weight)
        instance.weight_unit = validated_data.get('weight_unit', instance.weight_unit)
        instance.height = validated_data.get('height', instance.height)
        instance.height_unit = validated_data.get('height_unit', instance.height_unit)
        instance.body_fat_percentage = validated_data.get('body_fat_percentage', instance.body_fat_percentage)
        instance.muscle_mass_percentage = validated_data.get('muscle_mass_percentage', instance.muscle_mass_percentage)
        instance.water_weight_percentage = validated_data.get('water_weight_percentage', instance.water_weight_percentage)
        instance.bone_mass_weight = validated_data.get('bone_mass_weight', instance.bone_mass_weight)
        instance.bone_mass_weight_unit = validated_data.get('bone_mass_weight_unit', instance.bone_mass_weight_unit)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.visibility = validated_data.get('visibility', instance.visibility)

        instance.save()

        existing_records = UserBioData.objects.filter(user=user, date=instance.date).exclude(id=instance.id)
        existing_records.delete()

        return instance
