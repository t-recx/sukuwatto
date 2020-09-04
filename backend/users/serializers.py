from django.contrib.auth import get_user_model
from .models import File, UserInterest
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from rest_framework.validators import UniqueValidator

class ExpressInterestSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[UniqueValidator(queryset=UserInterest.objects.all())])

    class Meta:
        model = UserInterest
        fields = ['email']

class UserSerializer(serializers.ModelSerializer):
    def validate(self, data):
        if "password" in data:
            errors = dict()

            try:
                password_validation.validate_password(password=data.get('password'), user=get_user_model()(**data))
            except ValidationError as e:
                errors['password'] = list(e.messages)

            if errors:
                raise serializers.ValidationError(errors)

        return super(UserSerializer, self).validate(data)

    def create(self, validated_data):
        validated_data['username'] = validated_data['username'].lower()
        validated_data['email'] = validated_data['email'].lower()
        return get_user_model().objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email).lower()
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.month_birth = validated_data.get('month_birth', instance.month_birth)
        instance.year_birth = validated_data.get('year_birth', instance.year_birth)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.system = validated_data.get('system', instance.system)
        instance.biography = validated_data.get('biography', instance.biography)
        instance.location = validated_data.get('location', instance.location)
        instance.profile_filename = validated_data.get('profile_filename', instance.profile_filename)
        instance.default_weight_unit = validated_data.get('default_weight_unit', instance.default_weight_unit)
        instance.default_speed_unit = validated_data.get('default_speed_unit', instance.default_speed_unit)
        instance.default_distance_unit = validated_data.get('default_distance_unit', instance.default_distance_unit)
        instance.default_visibility_workouts = validated_data.get('default_visibility_workouts', instance.default_visibility_workouts)

        instance.save()

        return instance

    class Meta:
        model = get_user_model()
        fields = ['id', 'password', 'email', 'first_name', 'last_name', 
        'month_birth', 'year_birth', 'username', 'gender', 'groups', 
        'system', 'biography', 'location', 'profile_filename',
        'default_weight_unit', 'default_speed_unit', 'default_distance_unit',
        'is_staff', 'default_visibility_workouts']
        extra_kwargs = {'password': {'write_only': True, 'required': False},
            'email': {'write_only': True, 'required': False},
            'is_staff': { 'read_only': True, 'required': False}}

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"
