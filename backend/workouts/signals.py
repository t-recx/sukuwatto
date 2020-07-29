from django.db.models.signals import post_save
from actstream import action
from workouts.models import Workout, Plan, Exercise
from pprint import pprint
from actstream.models import Action
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

def workout_actstream_handler(sender, instance, created, **kwargs):
    if instance.status == Workout.FINISHED and instance.user:
        user_ctype_id = ContentType.objects.get(model='customuser').id
        workout_ctype_id = ContentType.objects.get(model='workout').id

        # we'll delete existing actions for same resource first:
        Action.objects.filter(
            Q(actor_content_type_id=user_ctype_id),
            Q(actor_object_id=str(instance.user.id)),
            Q(verb='trained'),
            Q(action_object_content_type_id=workout_ctype_id),
            Q(action_object_object_id=str(instance.id))).delete()

        action.send(instance.user, verb='trained', action_object=instance)

def plan_actstream_handler(sender, instance, created, **kwargs):
    if created and instance.user: 
        if instance.parent_plan:
            action.send(instance.user, verb='adopted', action_object=instance.parent_plan)
        else:
            action.send(instance.user, verb='created', action_object=instance)

def exercise_actstream_handler(sender, instance, created, **kwargs):
    if created and instance.user: 
        action.send(instance.user, verb='created', action_object=instance)

post_save.connect(workout_actstream_handler, sender=Workout)
post_save.connect(plan_actstream_handler, sender=Plan)
post_save.connect(exercise_actstream_handler, sender=Exercise)