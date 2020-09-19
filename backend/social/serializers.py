from rest_framework import serializers
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from datetime import datetime
from social.models import Message, LastMessage, Post, Comment, PostImage
from users.serializers import UserSerializer, UserMinimalSerializer
from django.utils import timezone
from workouts.utils import get_differences

class MessageReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'uuid', 'date', 'from_user', 'to_user', 'message']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'uuid', 'date', 'from_user', 'to_user', 'message']
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

class PostImageSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=PostImage()._meta.get_field('id'), required=False)

    class Meta:
        model = PostImage
        fields = ['id', 'url']

class PostSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    post_images = PostImageSerializer(many=True, required=False)

    class Meta:
        model = Post
        fields = ['id', 'title', 'text', 'date', 'user', 'edited_date', 'likes', 'comment_number', 'post_images']
        read_only_fields = ('likes','comment_number',)
        extra_kwargs = {'user': {'required': False},'date': {'required': False},'edited_date': {'required': False}}

    def create(self, validated_data):
        request = self.context.get("request")

        post_images_data = None

        if 'post_images' in validated_data:
            post_images_data = validated_data.pop('post_images')
            
        post = Post.objects.create(user=request.user, date=timezone.now(), **validated_data)

        if post_images_data is not None:
            self.create_post_images(post, post_images_data)

        return post

    def create_post_images(self, post, post_images_data):
        for post_image_data in post_images_data:
            PostImage.objects.create(post=post, **post_image_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.text = validated_data.get('text', instance.text)
        instance.edited_date = timezone.now()

        instance.save()

        post_images_data = None

        post_images = PostImage.objects.filter(post=instance)

        if 'post_images' in validated_data:
            post_images_data = validated_data.pop('post_images')

        if post_images_data is not None:
            new_data, updated_data, deleted_ids = get_differences(post_images_data, post_images.values())

            self.create_post_images(instance, new_data)

            self.update_post_images(updated_data)

            post_images_to_delete = PostImage.objects.filter(id__in=deleted_ids)
            post_images_to_delete.delete()
        else:
            post_images.delete()

        return instance

    def update_post_images(self, post_images_data):
        for post_image_data in post_images_data:
            instances = PostImage.objects.filter(pk=post_image_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            instance.url = post_image_data.get('url')

            instance.save()

class CommentSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'date', 'user', 'comment_target_object_id', 'comment_target_content_type',
            'target_plan', 'target_workout', 'target_post', 'target_exercise', 'target_user_bio_data']
        extra_kwargs = {'user': {'required': False},'date': {'required': False}}

    def create(self, validated_data):
        request = self.context.get("request")

        comment = Comment.objects.create(user=request.user, date=timezone.now(), **validated_data)

        return comment

    def update(self, instance, validated_data):
        instance.text = validated_data.get('text', instance.text)
        instance.edited_date = timezone.now()

        instance.save()

        return instance

class CommentMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'text']