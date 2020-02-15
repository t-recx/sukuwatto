from django.db.models.signals import post_save
from actstream import action
from social.models import Post, Comment
from pprint import pprint

def post_actstream_handler(sender, instance, created, **kwargs):
    if created:
        action.send(instance.user, verb='posted', action_object=instance)

def comment_actstream_handler(sender, instance, created, **kwargs):
    if created:
        action.send(instance.user, verb='commented', action_object=instance, target=instance.comment_target)

post_save.connect(post_actstream_handler, sender=Post)
post_save.connect(comment_actstream_handler, sender=Comment)

# todo: add post_delete methods too ?