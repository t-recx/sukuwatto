# Generated by Django 3.0.5 on 2021-01-11 00:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0030_remove_customuser_experience'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='experience',
            field=models.IntegerField(default=1000),
        ),
    ]
