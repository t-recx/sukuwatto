from django.db.models.signals import post_save
from actstream import action
from workouts.models import Workout
from pprint import pprint

def workout_actstream_handler(sender, instance, created, **kwargs):
    if not created and instance.status == Workout.FINISHED:
        action.send(instance.user, verb='trained', action_object=instance)

post_save.connect(workout_actstream_handler, sender=Workout)