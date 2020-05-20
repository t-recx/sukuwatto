# Generated by Django 2.2.5 on 2019-11-19 00:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0027_workingweight'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workout',
            name='end',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='workout',
            name='name',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='workoutgroup',
            name='name',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='workoutgroup',
            name='order',
            field=models.PositiveIntegerField(default=1),
        ),
    ]