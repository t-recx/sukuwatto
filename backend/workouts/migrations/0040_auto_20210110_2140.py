# Generated by Django 3.0.5 on 2021-01-10 21:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0039_auto_20210110_2137'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workoutset',
            name='experience',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='workoutwarmup',
            name='experience',
            field=models.IntegerField(default=0),
        ),
    ]
