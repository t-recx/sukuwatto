from django.db.models.signals import post_save, pre_delete
from actstream import action
from actstream.models import Action, Follow
from social.models import Post, Comment
from workouts.models import Workout, Plan, Exercise
from pprint import pprint
from users.models import CustomUser
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

def post_actstream_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        action.send(instance.user, verb='posted', action_object=instance)

def comment_actstream_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        action.send(instance.user, verb='commented', action_object=instance, target=instance.comment_target)

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

def delete_activity_handler(sender, instance, **kwargs):
    content_type = ContentType.objects.get(model='customuser')

    queryset = Action.objects.filter(Q(actor_content_type=content_type), Q(actor_object_id=str(instance.id)))

    queryset.delete()

    queryset = Action.objects.filter(Q(target_content_type=content_type), Q(target_object_id=str(instance.id)))

    queryset.delete()

    queryset = Action.objects.filter(Q(action_object_content_type=content_type), Q(action_object_object_id=str(instance.id)))

    queryset.delete()

    queryset = Follow.objects.filter(Q(content_type=content_type), Q(object_id=str(instance.id)))

    queryset.delete()

def delete_comment_activity(sender, instance, **kwargs):
    content_type = ContentType.objects.get(model='comment')
    target_content_type = instance.comment_target_content_type
    user_content_type = ContentType.objects.get(model='customuser')

    queryset = Action.objects.filter(Q(action_object_content_type=content_type), Q(action_object_object_id=str(instance.id)), Q(target_object_id=str(instance.comment_target)), Q(verb='commented'), Q(actor_object_id=str(instance.user)), Q(actor_content_type=user_content_type))

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
        model.comment_number -= 1

        if model.comment_number < 0:
            model.comment_number = 0

        model.save()

    queryset.delete()

post_save.connect(post_actstream_handler, sender=Post)
post_save.connect(comment_actstream_handler, sender=Comment)
post_save.connect(comment_update_comments_number_handler, sender=Comment)
pre_delete.connect(delete_comment_activity, sender=Comment)
pre_delete.connect(delete_activity_handler, sender=CustomUser)