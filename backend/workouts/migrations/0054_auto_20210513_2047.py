# Generated by Django 3.0.5 on 2021-05-13 20:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0053_exercise_name_pt'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='plansessiongroup',
            options={'ordering': ['order']},
        ),
    ]
