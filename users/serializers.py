from django.contrib.auth import get_user_model
from actstream.models import Action
from .models import File
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError

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

    class Meta:
        model = get_user_model()
        fields = ['id', 'password', 'email', 'first_name', 'last_name', 'month_birth', 'year_birth', 'username', 'gender', 'groups', 'system', 'biography', 'location', 'profile_filename']
        extra_kwargs = {'password': {'write_only': True, 'required': False},
            'email': {'write_only': True, 'required': False}}

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"
