from django.db.models.signals import post_save, pre_delete
from development.models import Feature, Release
from social.models import UserAction

def feature_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        UserAction.objects.create(user=instance.user, verb='requested', action_object_feature=instance)

def release_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        UserAction.objects.create(user=instance.user, verb='created', action_object_release=instance)

def delete_release_handler(sender, instance, **kwargs):
    Feature.objects.filter(release=instance).update(state='o')

post_save.connect(release_user_actions_handler, sender=Release)

post_save.connect(feature_user_actions_handler, sender=Feature)

pre_delete.connect(delete_release_handler, sender=Release)