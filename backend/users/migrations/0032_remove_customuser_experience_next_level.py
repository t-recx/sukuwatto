# Generated by Django 3.0.5 on 2021-01-11 01:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0031_customuser_experience'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='experience_next_level',
        ),
    ]