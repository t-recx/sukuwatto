# Generated by Django 3.0.5 on 2021-02-09 00:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0050_alltimeleaderboardposition'),
    ]

    operations = [
        migrations.AddField(
            model_name='workout',
            name='in_leaderboard',
            field=models.BooleanField(default=False),
        ),
    ]
