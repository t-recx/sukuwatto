# Generated by Django 2.2.5 on 2019-11-09 12:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('workouts', '0007_auto_20191102_1614'),
    ]

    operations = [
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('abbreviation', models.CharField(max_length=200)),
                ('system', models.CharField(choices=[('m', 'Metric'), ('i', 'Imperial')], max_length=1, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Workout',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField()),
                ('plan_session', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='workouts.PlanSession')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WorkoutSet',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField()),
                ('number_of_repetitions', models.PositiveIntegerField()),
                ('weight', models.DecimalField(decimal_places=2, max_digits=6)),
                ('exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workouts.Exercise')),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workouts.Unit')),
                ('workout', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workouts.Workout')),
            ],
        ),
        migrations.CreateModel(
            name='UnitConversion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ratio', models.DecimalField(decimal_places=8, max_digits=12)),
                ('from_unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='from_unit', to='workouts.Unit')),
                ('to_unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='to_unit', to='workouts.Unit')),
            ],
        ),
    ]
