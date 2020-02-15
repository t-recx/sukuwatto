from django.contrib.auth import get_user_model
from actstream.models import Action
from .models import File
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'password', 'first_name', 'last_name', 'month_birth', 'year_birth', 'username', 'email', 'gender', 'groups', 'system', 'biography', 'location', 'profile_filename']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"
