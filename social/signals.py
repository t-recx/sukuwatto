from django.db.models.signals import post_save
from actstream import action
from social.models import Post

# MyModel has been registered with actstream.registry.register

def my_handler(sender, instance, created, **kwargs):
    action.send(instance.user, verb='posted', action_object=instance)

post_save.connect(my_handler, sender=Post)