# Generated by Django 3.0.5 on 2020-08-27 13:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0026_auto_20200825_2053'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercise',
            name='comment_number',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='plan',
            name='comment_number',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='workout',
            name='comment_number',
            field=models.IntegerField(default=0),
        ),
    ]
