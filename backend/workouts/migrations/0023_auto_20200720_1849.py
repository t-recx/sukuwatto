# Generated by Django 3.0.5 on 2020-07-20 18:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0022_auto_20200720_1743'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='planprogressionstrategy',
            name='initial_value_unit',
        ),
        migrations.RemoveField(
            model_name='plansessiongroupprogressionstrategy',
            name='initial_value_unit',
        ),
        migrations.RemoveField(
            model_name='plansessionprogressionstrategy',
            name='initial_value_unit',
        ),
    ]
