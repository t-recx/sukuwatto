# Generated by Django 3.0.5 on 2021-01-10 22:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0025_customuser_custom_class'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='primary_class',
        ),
    ]