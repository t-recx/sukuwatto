# Generated by Django 3.0.5 on 2020-06-04 20:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0064_remove_workingparameter_parameter'),
    ]

    operations = [
        migrations.RenameField(
            model_name='planprogressionstrategy',
            old_name='weight_increase',
            new_name='parameter_increase',
        ),
        migrations.RenameField(
            model_name='plansessiongroupprogressionstrategy',
            old_name='weight_increase',
            new_name='parameter_increase',
        ),
        migrations.RenameField(
            model_name='plansessionprogressionstrategy',
            old_name='weight_increase',
            new_name='parameter_increase',
        ),
    ]
