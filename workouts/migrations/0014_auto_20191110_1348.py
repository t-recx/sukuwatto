# Generated by Django 2.2.5 on 2019-11-10 13:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0013_plansessiongroupwarmup'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='plansessiongroupexercise',
            name='is_warmup',
        ),
        migrations.RemoveField(
            model_name='plansessiongroupwarmup',
            name='is_warmup',
        ),
    ]
