from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse

from django_rest_passwordreset.signals import reset_password_token_created
from django.db.models import F
from django.db.models.signals import pre_delete
from .models import CustomUser
from workouts.rank_service import RankService
from users.tasks import email_reset_password_link
from django.conf import settings
from users.tasks import delete_image_file

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    host = settings.HOST

    link = "https://" + host + "/reset-password/" + reset_password_token.key

    email_reset_password_link(reset_password_token.user.username, reset_password_token.user.email, link)

def delete_user_account(sender, instance, **kwargs):
    if instance.profile_filename is not None:
        delete_image_file(instance.profile_filename, instance)

    users_with_follower = CustomUser.objects.filter(followers__id=instance.id)
    users_with_follower.update(followers_number=F('followers_number')-1)
    users_with_following = CustomUser.objects.filter(following__id=instance.id)
    users_with_following.update(followings_number=F('followings_number')-1)

    rank_service = RankService()
    rank_service.delete_rank_records(instance)

pre_delete.connect(delete_user_account, sender=CustomUser)