# Generated by Django 3.0.5 on 2020-07-10 22:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0016_workoutsettimesegment_workoutwarmuptimesegment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workoutsetposition',
            name='timestamp',
            field=models.BigIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='workoutwarmupposition',
            name='timestamp',
            field=models.BigIntegerField(null=True),
        ),
    ]
