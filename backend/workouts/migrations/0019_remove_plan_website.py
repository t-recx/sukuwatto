# Generated by Django 3.0.5 on 2020-07-14 20:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0018_metabolicequivalenttask_can_be_automatically_selected'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='plan',
            name='website',
        ),
    ]
