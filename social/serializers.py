from rest_framework import serializers
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from datetime import datetime
from social.models import Message, LastMessage
from users.serializers import UserSerializer
from pprint import pprint

class MessageReadSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'date', 'from_user', 'to_user', 'message']

class MessageSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'date', 'from_user', 'to_user', 'message']
        read_only_fields = ['date', 'from_user']

    def validate(self, data):
        request = self.context.get("request")

        if not request or not hasattr(request, "user") or isinstance(request.user, AnonymousUser):
            raise serializers.ValidationError("User not authenticated")

        return data

    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user

        instance = Message.objects.create(from_user=user,
            date=datetime.utcnow(), **validated_data)

        obj, created = LastMessage.objects.update_or_create(
            user=user,
            correspondent=instance.to_user,
            defaults={
                'date': instance.date,
                'last_message': instance,
                'last_read_message': instance,
                'unread_count': 0
            }
        )

        obj, created = LastMessage.objects.update_or_create(
            user=instance.to_user,
            correspondent=user,
            defaults={
                'date': instance.date,
                'last_message': instance
            }
        )

        obj.unread_count += 1
        obj.save()

        return instance

class LastMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    correspondent = UserSerializer(read_only=True)
    last_read_message = MessageSerializer(read_only=True)
    last_message = MessageSerializer(read_only=True)

    class Meta:
        model = LastMessage
        fields = ['id', 'date', 'user', 'correspondent',
            'last_read_message', 'last_message', 'unread_count']