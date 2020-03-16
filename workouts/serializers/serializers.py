from django.contrib.auth.models import AnonymousUser
from pprint import pprint
from rest_framework import serializers
from workouts.models import Exercise, Unit, UserBioData
from workouts.exercise_service import ExerciseService

class ExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=Exercise()._meta.get_field('id'), required=False)

    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'mechanics', 'force', 'modality', 'section', 'user']
        extra_kwargs = {'user': {'required': False}}

    def create(self, validated_data):
        return Exercise.objects.create(user=self.context.get("request").user, **validated_data)

    def update(self, instance, validated_data):
        es = ExerciseService()

        if es.in_use_on_other_users_resources(instance.id, self.context.get("request").user):
            raise serializers.ValidationError("Exercise in usage")

        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.mechanics = validated_data.get('mechanics', instance.mechanics)
        instance.force = validated_data.get('force', instance.force)
        instance.modality = validated_data.get('modality', instance.modality)
        instance.section = validated_data.get('section', instance.section)

        instance.save()

        return instance

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'name', 'abbreviation', 'system', 'measurement_type']

class UserBioDataSerializer(serializers.ModelSerializer):
    weight_unit_code = serializers.SerializerMethodField()
    height_unit_code = serializers.SerializerMethodField()
    bone_mass_weight_unit_code = serializers.SerializerMethodField()

    def get_weight_unit_code(self, obj):
        if obj.weight_unit:
            return obj.weight_unit.abbreviation
        
        return None

    def get_height_unit_code(self, obj):
        if obj.height_unit:
            return obj.height_unit.abbreviation
        
        return None

    def get_bone_mass_weight_unit_code(self, obj):
        if obj.bone_mass_weight_unit:
            return obj.bone_mass_weight_unit.abbreviation
        
        return None

    class Meta:
        model = UserBioData
        fields = ['id', 'date', 'weight', 'weight_unit', 'height', 'height_unit', 
            'body_fat_percentage', 'water_weight_percentage', 'muscle_mass_percentage',
            'bone_mass_weight', 'bone_mass_weight_unit', 'notes',
            'weight_unit_code', 'height_unit_code', 'bone_mass_weight_unit_code']

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

        instance.save()

        existing_records = UserBioData.objects.filter(user=user, date=instance.date).exclude(id=instance.id)
        existing_records.delete()

        return instance