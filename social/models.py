from django.db import models
from django.contrib.auth import get_user_model

class Post(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField()

class Message(models.Model):
    date = models.DateTimeField()
    from_user = models.ForeignKey(get_user_model(), related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(get_user_model(), related_name='to_user', on_delete=models.CASCADE)
    message = models.TextField()

class LastMessage(models.Model):
    date = models.DateTimeField()
    user = models.ForeignKey(get_user_model(), related_name='user', on_delete=models.CASCADE)
    correspondent = models.ForeignKey(get_user_model(), related_name='correspondent', on_delete=models.CASCADE)
    last_read_message = models.ForeignKey(Message, related_name='last_read_message', null=True, on_delete=models.SET_NULL)
    last_message = models.ForeignKey(Message, related_name='last_message', null=True, on_delete=models.SET_NULL)
    unread_count = models.IntegerField(default=0)