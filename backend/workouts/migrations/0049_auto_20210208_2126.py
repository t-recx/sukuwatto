# Generated by Django 3.0.5 on 2021-02-08 21:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0048_auto_20210208_2047'),
    ]

    operations = [
        migrations.AddField(
            model_name='monthlyleaderboardposition',
            name='rank',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='weeklyleaderboardposition',
            name='rank',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='yearlyleaderboardposition',
            name='rank',
            field=models.IntegerField(null=True),
        ),
    ]