from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import datetime
from users.serializers import UserSerializer, UserMinimalSerializer
from django.utils import timezone
from workouts.utils import get_differences
from development.models import Feature, FeatureImage

class FeatureImageSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=FeatureImage()._meta.get_field('id'), required=False)

    class Meta:
        model = FeatureImage
        fields = ['id', 'url']

class FeatureSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    feature_images = FeatureImageSerializer(many=True, required=False)

    class Meta:
        model = Feature
        fields = ['id', 'title', 'text', 'date', 'user', 'edited_date', 'likes', 'comment_number', 'feature_images']
        read_only_fields = ('likes','comment_number',)
        extra_kwargs = {'user': {'required': False},'date': {'required': False},'edited_date': {'required': False}}

    def create(self, validated_data):
        request = self.context.get("request")

        feature_images_data = None

        if 'feature_images' in validated_data:
            feature_images_data = validated_data.pop('feature_images')
            
        feature = Feature.objects.create(user=request.user, date=timezone.now(), **validated_data)

        if feature_images_data is not None:
            self.create_feature_images(feature, feature_images_data)

        return feature

    def create_feature_images(self, feature, feature_images_data):
        for feature_image_data in feature_images_data:
            FeatureImage.objects.create(feature=feature, **feature_image_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.text = validated_data.get('text', instance.text)
        instance.edited_date = timezone.now()

        instance.save()

        feature_images_data = None

        feature_images = FeatureImage.objects.filter(feature=instance)

        if 'feature_images' in validated_data:
            feature_images_data = validated_data.pop('feature_images')

        if feature_images_data is not None:
            new_data, updated_data, deleted_ids = get_differences(feature_images_data, feature_images.values())

            self.create_feature_images(instance, new_data)

            self.update_feature_images(updated_data)

            feature_images_to_delete = FeatureImage.objects.filter(id__in=deleted_ids)
            feature_images_to_delete.delete()
        else:
            feature_images.delete()

        return instance

    def update_feature_images(self, feature_images_data):
        for feature_image_data in feature_images_data:
            instances = FeatureImage.objects.filter(pk=feature_image_data.get('id'))

            if len(instances) == 0:
                continue

            instance = instances.first()

            instance.url = feature_image_data.get('url')

            instance.save()