from django.db.models.signals import post_save, pre_delete
from actstream import action
from actstream.models import Action, Follow
from social.models import Post, Comment
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


post_save.connect(post_actstream_handler, sender=Post)
post_save.connect(comment_actstream_handler, sender=Comment)
pre_delete.connect(delete_activity_handler, sender=CustomUser)