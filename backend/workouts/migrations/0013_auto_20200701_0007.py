# Generated by Django 3.0.5 on 2020-07-01 00:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0012_auto_20200630_1718'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workingparameter',
            name='parameter_value',
            field=models.DecimalField(decimal_places=3, max_digits=8, null=True),
        ),
        migrations.AlterField(
            model_name='workingparameter',
            name='previous_parameter_value',
            field=models.DecimalField(decimal_places=3, max_digits=8, null=True),
        ),
        migrations.AlterField(
            model_name='workout',
            name='calories',
            field=models.DecimalField(decimal_places=3, max_digits=8, null=True),
        ),
        migrations.AlterField(
            model_name='workoutset',
            name='calories',
            field=models.DecimalField(decimal_places=3, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='workoutset',
            name='expected_weight',
            field=models.DecimalField(decimal_places=3, max_digits=7, null=True),
        ),
        migrations.AlterField(
            model_name='workoutset',
            name='weight',
            field=models.DecimalField(decimal_places=3, max_digits=7, null=True),
        ),
        migrations.AlterField(
            model_name='workoutwarmup',
            name='calories',
            field=models.DecimalField(decimal_places=3, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='workoutwarmup',
            name='expected_weight',
            field=models.DecimalField(decimal_places=3, max_digits=7, null=True),
        ),
        migrations.AlterField(
            model_name='workoutwarmup',
            name='weight',
            field=models.DecimalField(decimal_places=3, max_digits=7, null=True),
        ),
    ]
