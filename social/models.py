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
