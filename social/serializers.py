from rest_framework import serializers
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from datetime import datetime
from social.models import Message, LastMessage, Post, Comment
from users.serializers import UserSerializer
from pprint import pprint

class MessageReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'date', 'from_user', 'to_user', 'message']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'date', 'from_user', 'to_user', 'message']
        read_only_fields = ['date', 'from_user']

class LastMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    correspondent = UserSerializer(read_only=True)
    last_read_message = MessageSerializer(read_only=True)
    last_message = MessageSerializer(read_only=True)

    class Meta:
        model = LastMessage
        fields = ['id', 'date', 'user', 'correspondent',
            'last_read_message', 'last_message', 'unread_count']

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'text', 'date', 'user']
        extra_kwargs = {'user': {'required': False},'date': {'required': False}}

    def validate(self, data):
        request = self.context.get("request")

        if not request or not hasattr(request, "user") or isinstance(request.user, AnonymousUser):
            raise serializers.ValidationError("User not authenticated")

        if self.instance and self.instance.user.id != request.user.id:
            raise serializers.ValidationError("User doesn't own resource")

        return data

    def create(self, validated_data):
        request = self.context.get("request")

        post = Post.objects.create(user=request.user, date=datetime.utcnow(), **validated_data)

        return post

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.text = validated_data.get('text', instance.text)

        instance.save()

        return instance

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'date', 'user', 'comment_target_object_id', 'comment_target_content_type']
        extra_kwargs = {'user': {'required': False},'date': {'required': False}}

    def validate(self, data):
        request = self.context.get("request")

        if not request or not hasattr(request, "user") or isinstance(request.user, AnonymousUser):
            raise serializers.ValidationError("User not authenticated")

        if self.instance and self.instance.user.id != request.user.id:
            raise serializers.ValidationError("User doesn't own resource")

        return data

    def create(self, validated_data):
        request = self.context.get("request")

        comment = Comment.objects.create(user=request.user, date=datetime.utcnow(), **validated_data)

        return comment

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.text = validated_data.get('text', instance.text)

        instance.save()

        return instance
