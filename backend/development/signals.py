from django.db.models.signals import post_save
from development.models import Feature
from social.models import UserAction

def feature_user_actions_handler(sender, instance, created, **kwargs):
    if created and instance.user:
        UserAction.objects.create(user=instance.user, verb='requested', action_object_feature=instance)

post_save.connect(feature_user_actions_handler, sender=Feature)