# Generated by Django 3.0.5 on 2021-02-08 23:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0036_customuser_rank'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='rank',
        ),
    ]
