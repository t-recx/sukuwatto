from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from workouts.models import Workout, Plan, Exercise, UserBioData
from django.utils.timezone import now
from django_cryptography.fields import encrypt

class Post(models.Model):
    title = models.CharField(max_length=200, null=True)
    text = models.TextField()
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    user = models.ForeignKey(get_user_model(), related_name='user_post', on_delete=models.CASCADE)
    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)

    def __str__(self):
        return self.text

class PostImage(models.Model):
    url = models.CharField(max_length=1024)
    post = models.ForeignKey(Post, related_name='post_images', on_delete=models.CASCADE)

class Comment(models.Model):
    text = models.TextField()
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    comment_target_content_type = models.ForeignKey(
        ContentType, related_name='comment_target',
        on_delete=models.CASCADE, db_index=True
    )
    comment_target_object_id = models.CharField(max_length=255, db_index=True)
    comment_target = GenericForeignKey('comment_target_content_type', 'comment_target_object_id')

    target_workout = models.ForeignKey(Workout, related_name='comment_target_workout', on_delete=models.CASCADE, blank= True, null=True)
    target_plan = models.ForeignKey(Plan, related_name='comment_target_plan', on_delete=models.CASCADE, blank= True, null=True)
    target_exercise = models.ForeignKey(Exercise, related_name='comment_target_exercise', on_delete=models.CASCADE, blank= True, null=True)
    target_post = models.ForeignKey(Post, related_name='comment_target_post', on_delete=models.CASCADE, blank= True, null=True)
    target_user_bio_data = models.ForeignKey(UserBioData, related_name='comment_target_user_bio_data', on_delete=models.CASCADE, blank= True, null=True)

    def __str__(self):
        return self.text

class Message(models.Model):
    uuid = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    from_user = models.ForeignKey(get_user_model(), related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(get_user_model(), related_name='to_user', on_delete=models.CASCADE)
    message = encrypt(models.TextField())

class LastMessage(models.Model):
    date = models.DateTimeField()
    user = models.ForeignKey(get_user_model(), related_name='user_lastmessage', on_delete=models.CASCADE)
    correspondent = models.ForeignKey(get_user_model(), related_name='correspondent', on_delete=models.CASCADE)
    last_read_message = models.ForeignKey(Message, related_name='last_read_message', null=True, on_delete=models.SET_NULL)
    last_message = models.ForeignKey(Message, related_name='last_message', null=True, on_delete=models.SET_NULL)
    unread_count = models.IntegerField(default=0)

class UserAction(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, db_index=True)

    verb = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=now, db_index=True)

    target_workout = models.ForeignKey(Workout, related_name='target_workout', on_delete=models.CASCADE, blank= True, null=True)
    target_plan = models.ForeignKey(Plan, related_name='target_plan', on_delete=models.CASCADE, blank= True, null=True)
    target_exercise = models.ForeignKey(Exercise, related_name='target_exercise', on_delete=models.CASCADE, blank= True, null=True)
    target_post = models.ForeignKey(Post, related_name='target_post', on_delete=models.CASCADE, blank= True, null=True)
    target_comment = models.ForeignKey(Comment, related_name='target_comment', on_delete=models.CASCADE, blank= True, null=True)
    target_user_bio_data = models.ForeignKey(UserBioData, related_name='target_user_bio_data', on_delete=models.CASCADE, blank= True, null=True)
    target_user = models.ForeignKey(get_user_model(), related_name='target_user', on_delete=models.CASCADE, db_index=True, blank=True, null=True)

    action_object_workout = models.ForeignKey(Workout, related_name='action_object_workout', on_delete=models.CASCADE, blank= True, null=True)
    action_object_plan = models.ForeignKey(Plan, related_name='action_object_plan', on_delete=models.CASCADE, blank= True, null=True)
    action_object_exercise = models.ForeignKey(Exercise, related_name='action_object_exercise', on_delete=models.CASCADE, blank= True, null=True)
    action_object_post = models.ForeignKey(Post, related_name='action_object_post', on_delete=models.CASCADE, blank= True, null=True)
    action_object_comment = models.ForeignKey(Comment, related_name='action_object_comment', on_delete=models.CASCADE, blank= True, null=True)
    action_object_user_bio_data = models.ForeignKey(UserBioData, related_name='action_object_user_bio_data', on_delete=models.CASCADE, blank= True, null=True)
    action_object_user = models.ForeignKey(get_user_model(), related_name='action_object_user', on_delete=models.CASCADE, blank=True, null=True)

class Report(models.Model):
    OPEN = 'o'
    CLOSED = 'c'
    RESOLVED = 'r'

    REPORT_STATES = [
        (OPEN, 'Open'),
        (CLOSED, 'Closed'),
        (RESOLVED, 'Resolved'),
    ]

    description = models.TextField()
    notes = models.TextField(blank=True, null=True)
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    state = models.CharField(max_length=1, choices=REPORT_STATES, default=OPEN)

    target_workout = models.ForeignKey(Workout, related_name='report_target_workout', on_delete=models.CASCADE, blank= True, null=True)
    target_plan = models.ForeignKey(Plan, related_name='report_target_plan', on_delete=models.CASCADE, blank= True, null=True)
    target_exercise = models.ForeignKey(Exercise, related_name='report_target_exercise', on_delete=models.CASCADE, blank= True, null=True)
    target_post = models.ForeignKey(Post, related_name='report_target_post', on_delete=models.CASCADE, blank= True, null=True)
    target_comment = models.ForeignKey(Comment, related_name='report_target_comment', on_delete=models.CASCADE, blank= True, null=True)
    target_user = models.ForeignKey(get_user_model(), related_name='report_target_user', on_delete=models.CASCADE, blank= True, null=True)