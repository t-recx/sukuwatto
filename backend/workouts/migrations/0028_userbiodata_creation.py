# Generated by Django 3.0.5 on 2020-09-18 17:09

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0027_auto_20200827_1357'),
    ]

    operations = [
        migrations.AddField(
            model_name='userbiodata',
            name='creation',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
