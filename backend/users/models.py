from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class UserInterest(models.Model):
    email = models.EmailField(_('email address'))

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

    EVERYONE = 'e'
    REGISTERED_USERS = 'r'
    FOLLOWERS = 'f'
    OWN_USER = 'u'

    VISIBILITIES =  [
        (EVERYONE, 'Everyone'),
        (REGISTERED_USERS, 'Registered users'),
        (FOLLOWERS, 'Followers'),
        (OWN_USER, 'Own user')
    ]

    gender = models.CharField(max_length=1, null=True, choices=GENDER_CHOICES)
    year_birth = models.IntegerField(null=True)
    month_birth = models.IntegerField(null=True)
    system = models.CharField(max_length=1, choices=SYSTEMS)
    location = models.CharField(max_length=200, null=True)
    biography = models.TextField(null=True)
    profile_filename = models.CharField(max_length=1024, null=True)
    default_weight_unit = models.IntegerField(null=True)
    default_speed_unit = models.IntegerField(null=True)
    default_distance_unit = models.IntegerField(null=True)

    default_visibility_workouts = models.CharField(max_length=1, choices=VISIBILITIES, default=EVERYONE)

    visibility_profile = models.CharField(max_length=1, choices=VISIBILITIES, default=EVERYONE)

    follow_approval_required  = models.BooleanField(default=False)

    followers = models.ManyToManyField("self", related_name='user_followers', blank=True, symmetrical=False)
    following = models.ManyToManyField("self", related_name='user_following', blank=True, symmetrical=False)
    follower_requests = models.ManyToManyField("self", related_name='user_follower_requests', blank=True, symmetrical=False)

    def __str__(self):
        return self.username

class File(models.Model):
    file = models.ImageField(blank=False, null=False)

    def __str__(self):
        return self.file.name