from django.db import models
from django.contrib.auth import get_user_model

class Post(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField()