# Generated by Django 3.0.5 on 2021-04-25 13:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0053_exercise_name_pt'),
        ('development', '0013_auto_20210101_1737'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('social', '0021_auto_20201030_1703'),
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('notes', models.TextField()),
                ('date', models.DateTimeField()),
                ('edited_date', models.DateTimeField(null=True)),
                ('state', models.CharField(choices=[('o', 'Open'), ('c', 'Closed'), ('r', 'Resolved')], default='o', max_length=1)),
                ('target_exercise', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_exercise', to='workouts.Exercise')),
                ('target_feature', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_feature', to='development.Feature')),
                ('target_plan', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_plan', to='workouts.Plan')),
                ('target_post', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_post', to='social.Post')),
                ('target_release', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_release', to='development.Release')),
                ('target_user_bio_data', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_user_bio_data', to='workouts.UserBioData')),
                ('target_workout', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_workout', to='workouts.Workout')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
