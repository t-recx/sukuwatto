# Generated by Django 3.0.5 on 2020-06-27 17:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0005_auto_20200627_1712'),
    ]

    operations = [
        migrations.RenameField(
            model_name='metabolicequivalenttask',
            old_name='weight_unit',
            new_name='unit',
        ),
    ]