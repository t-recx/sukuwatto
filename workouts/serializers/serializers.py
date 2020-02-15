from django.contrib.auth.models import AnonymousUser
from pprint import pprint
from rest_framework import serializers
from workouts.models import Exercise, Unit, UnitConversion, UserBioData

class ExerciseSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=Exercise()._meta.get_field('id'), required=False)

    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'mechanics', 'force', 'modality', 'section', 'owner']

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'name', 'abbreviation', 'system', 'measurement_type']

class UnitConversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitConversion
        fields = ['id', 'from_unit', 'to_unit', 'ratio']

class UserBioDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBioData
        fields = ['id', 'date', 'weight', 'weight_unit', 'height', 'height_unit', 
            'body_fat_percentage', 'water_weight_percentage', 'muscle_mass_percentage',
            'bone_mass_weight', 'bone_mass_weight_unit', 'notes']

    def validate(self, data):
        request = self.context.get("request")

        if not request or not hasattr(request, "user") or isinstance(request.user, AnonymousUser):
            raise serializers.ValidationError("User not authenticated")

        return data

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