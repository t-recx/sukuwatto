# Generated by Django 3.0.5 on 2020-07-29 21:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_auto_20200727_2125'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='profile_visibility',
        ),
    ]
