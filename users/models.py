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

    METRIC = 'm'
    IMPERIAL = 'i'
    SYSTEMS = [
        (METRIC, 'Metric'),
        (IMPERIAL, 'Imperial'),
    ]

    gender = models.CharField(max_length=1, null=True, choices=GENDER_CHOICES)
    year_birth = models.IntegerField(null=True)
    month_birth = models.IntegerField(null=True)
    system = models.CharField(max_length=1, null=True, choices=SYSTEMS)
    location = models.CharField(max_length=200, null=True)
    biography = models.TextField(null=True)
    profile_filename = models.CharField(max_length=1024, null=True)

    def __str__(self):
        return self.email

class File(models.Model):
    file = models.FileField(blank=False, null=False)

    def __str__(self):
        return self.file.name