# Generated by Django 3.0.5 on 2020-10-02 00:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0035_auto_20201001_2126'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exercise',
            name='muscle',
        ),
    ]