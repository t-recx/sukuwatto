from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from social.models import UserAction
from social.serializers import PostSerializer, CommentSerializer, CommentMinimalSerializer
from users.serializers import UserSerializer, UserMinimalSerializer
from workouts.serializers.workout_serializer import WorkoutOverviewSerializer
from workouts.serializers.plan_serializer import PlanSerializer
from workouts.serializers.serializers import ExerciseSerializer

class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = "__all__"

class ActionSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer()

    target_user = UserMinimalSerializer()
    target_workout = WorkoutOverviewSerializer()
    target_plan = PlanSerializer()
    target_post = PostSerializer()
    target_comment = CommentMinimalSerializer()
    target_exercise = ExerciseSerializer()

    action_object_user = UserMinimalSerializer()
    action_object_workout = WorkoutOverviewSerializer()
    action_object_plan = PlanSerializer()
    action_object_post = PostSerializer()
    action_object_comment = CommentMinimalSerializer()
    action_object_exercise = ExerciseSerializer()

    class Meta:
        model = UserAction
        fields = "__all__"