# Generated by Django 2.2.5 on 2019-11-26 03:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0032_auto_20191126_0257'),
    ]

    operations = [
        migrations.RenameField(
            model_name='workoutset',
            old_name='plan_session_group_exercise',
            new_name='plan_session_group_activity',
        ),
        migrations.RenameField(
            model_name='workoutwarmup',
            old_name='plan_session_group_warmup',
            new_name='plan_session_group_activity',
        ),
    ]