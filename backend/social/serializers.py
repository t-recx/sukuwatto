from rest_framework import serializers
from development.serializers import FeatureSerializer
from sqtrex.exceptions import CustomAPIException
from rest_framework import status
from rest_framework.exceptions import APIException
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from datetime import datetime
from social.models import Message, LastMessage, Post, Comment, PostImage, UserAction, Report
from users.serializers import UserSerializer, UserMinimalSerializer
from development.models import Feature
from django.utils import timezone
from workouts.utils import get_differences
from users.tasks import delete_image_file

class MessageReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'uuid', 'date', 'edited_date', 'from_user', 'to_user', 'message']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'uuid', 'date', 'edited_date', 'from_user', 'to_user', 'message']
        read_only_fields = ['date', 'edited_date', 'from_user']

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
            self.delete_post_images(post_images_to_delete, instance.user)
        else:
            self.delete_post_images(post_images, instance.user)

        return instance

    def delete_post_images(self, post_images, user):
        for post_image_data in post_images:
            delete_image_file(post_image_data.url, user)

        post_images.delete()

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
        fields = ['id', 'text', 'date', 'edited_date', 'user', 'comment_target_object_id', 'comment_target_content_type',
            'target_plan', 'target_workout', 'target_post', 'target_exercise', 'target_user_bio_data', 'target_feature',
            'target_release']
        extra_kwargs = {'user': {'required': False},'date': {'required': False}}

    def validate_target_feature(self, target_feature):
        user = self.context['request'].user

        if target_feature != None and not user.is_staff and user.tier == 'n':
            raise CustomAPIException(detail='Tier doesn''t allow commenting of features', status_code=status.HTTP_403_FORBIDDEN)

        return target_feature

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
        fields = ['id', 'text', 'date', 'edited_date']

class ReportSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    target_username = serializers.SerializerMethodField()
    target_comment_text = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = "__all__"
        extra_kwargs = {'user': {'required': False},'date': {'required': False}}

    def get_target_username(self, obj):
        if obj.target_user is None:
            return None

        return obj.target_user.username

    def get_target_comment_text(self, obj):
        if obj.target_comment is None:
            return None

        return obj.target_comment.text

    def create(self, validated_data):
        request = self.context.get("request")

        comment = Report.objects.create(user=request.user, date=timezone.now(), **validated_data)

        return comment

    def update(self, instance, validated_data):
        instance.notes = validated_data.get('notes', instance.notes)
        instance.state = validated_data.get('state', instance.state)
        instance.edited_date = timezone.now()

        instance.save()

        return instance