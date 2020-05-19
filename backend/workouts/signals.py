from django.db.models.signals import post_save
from actstream import action
from workouts.models import Workout, Plan
from pprint import pprint

def workout_actstream_handler(sender, instance, created, **kwargs):
    if instance.status == Workout.FINISHED:
        action.send(instance.user, verb='trained', action_object=instance)

def plan_actstream_handler(sender, instance, created, **kwargs):
    if created: 
        if instance.parent_plan:
            action.send(instance.user, verb='adopted', action_object=instance.parent_plan)
        else:
            action.send(instance.user, verb='created', action_object=instance)

post_save.connect(workout_actstream_handler, sender=Workout)
post_save.connect(plan_actstream_handler, sender=Plan)