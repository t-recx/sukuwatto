from django.db import models
from django.contrib.auth import get_user_model

class Release(models.Model):
    # UNDER_VOTING = 'v'
    IN_PROGRESS = 'p'
    DONE = 'd'

    RELEASE_STATES = [
        # (UNDER_VOTING, 'Up for voting'),
        (IN_PROGRESS, 'In progress'),
        (DONE, 'Done'),
    ]

    version = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    deploy_date = models.DateTimeField(null=True)
    state = models.CharField(max_length=1, choices=RELEASE_STATES, default=IN_PROGRESS)
    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)
    user = models.ForeignKey(get_user_model(), related_name='user_release', on_delete=models.CASCADE)

class Feature(models.Model):
    OPEN = 'o'
    # UNDER_VOTING = 'v'
    IN_PROGRESS = 'p'
    DONE = 'd'
    CLOSED = 'c'

    FEATURE_STATES = [
        (OPEN, 'Open'),
        # (UNDER_VOTING, 'Up for voting'),
        (IN_PROGRESS, 'In progress'),
        (DONE, 'Done'),
        (CLOSED, 'Closed'),
    ]

    title = models.CharField(max_length=200, null=True)
    text = models.TextField()
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    user = models.ForeignKey(get_user_model(), related_name='user_feature', on_delete=models.CASCADE)
    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)
    release = models.ForeignKey(Release, on_delete=models.SET_NULL, blank= True, null=True, related_name='features')

    state = models.CharField(max_length=1, choices=FEATURE_STATES, default=OPEN)

    def __str__(self):
        return self.text

class FeatureImage(models.Model):
    url = models.CharField(max_length=1024)
    feature = models.ForeignKey(Feature, related_name='feature_images', on_delete=models.CASCADE)