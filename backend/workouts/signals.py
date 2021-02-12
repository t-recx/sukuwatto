from django.db.models.signals import post_save, pre_delete
from social.models import UserAction
from workouts.models import Workout, Plan, Exercise, UserBioData
from pprint import pprint
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from workouts.level_service import LevelService

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

def user_bio_data_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user: 
        UserAction.objects.create(user=instance.user, verb='measured', action_object_user_bio_data=instance)

def delete_workout_handler(sender, instance, **kwargs):
    level_service = LevelService()
    level_service.remove_experience_workout(instance)

post_save.connect(workout_user_actions_handler, sender=Workout)
post_save.connect(plan_user_actions_handler, sender=Plan)
post_save.connect(exercise_user_actions_handler, sender=Exercise)
post_save.connect(user_bio_data_user_actions_handler, sender=UserBioData)

pre_delete.connect(delete_workout_handler, sender=Workout)