from django.db.models.signals import post_save
from social.models import UserAction
from workouts.models import Workout, Plan, Exercise
from pprint import pprint
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

def workout_user_actions_handler(sender, instance, created, **kwargs):
    if instance.status == Workout.FINISHED and instance.user:
        user_ctype_id = ContentType.objects.get(model='customuser').id
        workout_ctype_id = ContentType.objects.get(model='workout').id

        # we'll create an action only if one doesn't exist already:
        if not UserAction.objects.filter(
            Q(user=instance.user),
            Q(verb='trained'),
            Q(action_object_workout=instance)).exists():
            UserAction.objects.create(user=instance.user, verb='trained', action_object_workout=instance)

def plan_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user: 
        if instance.parent_plan:
            UserAction.objects.create(user=instance.user, verb='adopted', action_object_plan=instance.parent_plan)
        else:
            UserAction.objects.create(user=instance.user, verb='created', action_object_plan=instance)

def exercise_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user: 
        UserAction.objects.create(user=instance.user, verb='created', action_object_exercise=instance)

post_save.connect(workout_user_actions_handler, sender=Workout)
post_save.connect(plan_user_actions_handler, sender=Plan)
post_save.connect(exercise_user_actions_handler, sender=Exercise)