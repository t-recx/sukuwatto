# Generated by Django 3.0.5 on 2020-09-18 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0029_auto_20200918_1801'),
    ]

    operations = [
        migrations.AddField(
            model_name='userbiodata',
            name='visibility',
            field=models.CharField(choices=[('e', 'Everyone'), ('r', 'Registered users'), ('f', 'Followers'), ('u', 'Own user')], default='e', max_length=1),
        ),
    ]
