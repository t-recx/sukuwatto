# Generated by Django 3.0.5 on 2021-02-04 23:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0045_monthlyleaderboardposition_weeklyleaderboardposition_yearlyleaderboardposition'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monthlyleaderboardposition',
            name='experience',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='weeklyleaderboardposition',
            name='experience',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='yearlyleaderboardposition',
            name='experience',
            field=models.IntegerField(default=0),
        ),
    ]
