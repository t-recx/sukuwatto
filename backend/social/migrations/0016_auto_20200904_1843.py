# Generated by Django 3.0.5 on 2020-09-04 18:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0027_auto_20200827_1357'),
        ('social', '0015_auto_20200903_1240'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='target_exercise',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comment_target_exercise', to='workouts.Exercise'),
        ),
        migrations.AddField(
            model_name='comment',
            name='target_plan',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comment_target_plan', to='workouts.Plan'),
        ),
        migrations.AddField(
            model_name='comment',
            name='target_post',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comment_target_post', to='social.Post'),
        ),
        migrations.AddField(
            model_name='comment',
            name='target_workout',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comment_target_workout', to='workouts.Workout'),
        ),
    ]
