# Generated by Django 3.0.5 on 2021-01-10 21:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0038_auto_20210110_2123'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workoutset',
            name='experience',
            field=models.IntegerField(blank=True, default=0),
        ),
        migrations.AlterField(
            model_name='workoutwarmup',
            name='experience',
            field=models.IntegerField(blank=True, default=0),
        ),
    ]