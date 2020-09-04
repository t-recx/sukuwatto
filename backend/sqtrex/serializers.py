from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from social.models import UserAction
from social.serializers import PostSerializer, CommentSerializer
from users.serializers import UserSerializer
from workouts.serializers.workout_serializer import WorkoutSerializer
from workouts.serializers.plan_serializer import PlanSerializer
from workouts.serializers.serializers import ExerciseSerializer

class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = "__all__"

class ActionSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    target_user = UserSerializer()
    target_workout = WorkoutSerializer()
    target_plan = PlanSerializer()
    target_post = PostSerializer()
    target_comment = CommentSerializer()
    target_exercise = ExerciseSerializer()

    action_object_user = UserSerializer()
    action_object_workout = WorkoutSerializer()
    action_object_plan = PlanSerializer()
    action_object_post = PostSerializer()
    action_object_comment = CommentSerializer()
    action_object_exercise = ExerciseSerializer()

    class Meta:
        model = UserAction
        fields = "__all__"