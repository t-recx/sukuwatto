from django.db import models
from django.contrib.auth import get_user_model

class Feature(models.Model):
    title = models.CharField(max_length=200, null=True)
    text = models.TextField()
    date = models.DateTimeField()
    edited_date = models.DateTimeField(null=True)
    user = models.ForeignKey(get_user_model(), related_name='user_feature', on_delete=models.CASCADE)
    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)

    def __str__(self):
        return self.text

class FeatureImage(models.Model):
    url = models.CharField(max_length=1024)
    feature = models.ForeignKey(Feature, related_name='feature_images', on_delete=models.CASCADE)
