from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    MALE = 'm'
    FEMALE = 'f'
    NONBINARY = 'n'
    GENDER_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (NONBINARY, 'Non-Binary')
    ]

    gender = models.CharField(max_length=1, null=True, choices=GENDER_CHOICES)
    year_birth = models.IntegerField(null=True)
    month_birth = models.IntegerField(null=True)

    def __str__(self):
        return self.email
