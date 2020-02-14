from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class Post(models.Model):
    title = models.CharField(max_length=200, null=True)
    text = models.TextField()
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    user = models.ForeignKey(get_user_model(), related_name='owner', on_delete=models.CASCADE)

    def __str__(self):
        return self.text

class Comment(models.Model):
    text = models.TextField()
    date = models.DateTimeField()
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    comment_target_content_type = models.ForeignKey(
        ContentType, related_name='comment_target',
        on_delete=models.CASCADE, db_index=True
    )
    comment_target_object_id = models.CharField(max_length=255, db_index=True)
    comment_target = GenericForeignKey('comment_target_content_type', 'comment_target_object_id')

    def __str__(self):
        return self.text

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
