from django.contrib.auth import get_user_model
from .models import File
from django.contrib.auth.models import Group
from rest_framework import serializers

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'password', 'url', 'first_name', 'last_name', 'month_birth', 'year_birth', 'username', 'email', 'gender', 'groups', 'system', 'biography', 'location']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'url', 'name']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"