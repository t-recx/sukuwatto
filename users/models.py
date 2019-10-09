from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    MALE = 'm'
    FEMALE = 'f'
    GENDER_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female'),
    ]

    gender = models.CharField(max_length=1, null=True, choices=GENDER_CHOICES)

    def __str__(self):
        return self.email
