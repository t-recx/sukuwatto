from django.db.models.signals import post_save, pre_delete
from social.models import Post, Comment, UserAction
from social.utils import get_user_actions_filtered_by_object
from workouts.models import Workout, Plan, Exercise
from pprint import pprint
from users.models import CustomUser
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

def post_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        UserAction.objects.create(user=instance.user, verb='posted', action_object_post=instance)

def comment_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        target_content_type = instance.comment_target_content_type
        object_model = target_content_type.model
        object_id = int(instance.comment_target_object_id)

        target_workout = None
        target_plan = None
        target_post = None
        target_exercise = None

        if object_model == 'workout':
            target_workout = Workout.objects.get(pk=object_id)
        elif object_model == 'plan':
            target_plan = Plan.objects.get(pk=object_id)
        elif object_model == 'post':
            target_post = Post.objects.get(pk=object_id)
        elif object_model == 'exercise':
            target_exercise = Exercise.objects.get(pk=object_id)

        UserAction.objects.create(
            user=instance.user, verb='commented', 
            action_object_comment=instance, 
            target_post=target_post, 
            target_workout=target_workout, 
            target_plan=target_plan, 
            target_exercise=target_exercise)

def comment_update_comments_number_handler(sender, instance, created, **kwargs):
    if created:
        target_content_type = instance.comment_target_content_type
        object_model = target_content_type.model
        object_id = int(instance.comment_target_object_id)

        model = None

        if object_model == 'workout':
            model = Workout.objects.get(pk=object_id)
        elif object_model == 'plan':
            model = Plan.objects.get(pk=object_id)
        elif object_model == 'post':
            model = Post.objects.get(pk=object_id)
        elif object_model == 'exercise':
            model = Exercise.objects.get(pk=object_id)

        if model:
            model.comment_number += 1

            if model.comment_number < 0:
                model.comment_number = 0

            model.save()

def delete_comment_activity(sender, instance, **kwargs):
    content_type = ContentType.objects.get(model='comment')
    target_content_type = instance.comment_target_content_type

    object_model = target_content_type.model
    object_id = int(instance.comment_target_object_id)

    model = None

    if object_model == 'workout':
        model = Workout.objects.filter(pk=object_id).first()
    elif object_model == 'plan':
        model = Plan.objects.filter(pk=object_id).first()
    elif object_model == 'post':
        model = Post.objects.filter(pk=object_id).first()
    elif object_model == 'exercise':
        model = Exercise.objects.filter(pk=object_id).first()

    if model:
        model.comment_number -= 1

        if model.comment_number < 0:
            model.comment_number = 0

        model.save()

post_save.connect(post_user_actions_handler, sender=Post)
post_save.connect(comment_user_actions_handler, sender=Comment)
post_save.connect(comment_update_comments_number_handler, sender=Comment)
pre_delete.connect(delete_comment_activity, sender=Comment)