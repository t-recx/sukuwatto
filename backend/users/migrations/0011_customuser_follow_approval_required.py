# Generated by Django 3.0.5 on 2020-09-06 15:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_auto_20200902_1410'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='follow_approval_required',
            field=models.BooleanField(default=False),
        ),
    ]