# Generated by Django 3.0.5 on 2020-08-31 21:02

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_delete_followerrelationship'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='followers',
            field=models.ManyToManyField(blank=True, related_name='_customuser_followers_+', to=settings.AUTH_USER_MODEL),
        ),
    ]
