# Generated by Django 3.0.5 on 2020-05-21 16:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0056_auto_20200515_1745'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercise',
            name='short_name',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]
