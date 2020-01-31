from django.db.models.signals import post_save
from actstream import action
from social.models import Post
from pprint import pprint

def post_actstream_handler(sender, instance, created, **kwargs):
    if created:
        action.send(instance.user, verb='posted', action_object=instance)

post_save.connect(post_actstream_handler, sender=Post)