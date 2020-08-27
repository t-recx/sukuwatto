# Generated by Django 3.0.5 on 2020-08-25 20:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0025_workout_visibility'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercise',
            name='likes',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='plan',
            name='likes',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='workout',
            name='likes',
            field=models.IntegerField(default=0),
        ),
    ]
