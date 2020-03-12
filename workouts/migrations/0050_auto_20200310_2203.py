# Generated by Django 2.2.4 on 2020-03-10 22:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0049_update_push_enum'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercise',
            name='force',
            field=models.CharField(choices=[('p', 'Pull'), ('q', 'Push'), ('s', 'Static')], max_length=1, null=True),
        ),
        migrations.AlterField(
            model_name='planprogressionstrategy',
            name='exercise',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
        migrations.AlterField(
            model_name='planprogressionstrategy',
            name='force',
            field=models.CharField(choices=[('p', 'Pull'), ('q', 'Push'), ('s', 'Static')], max_length=1, null=True),
        ),
        migrations.AlterField(
            model_name='plansessiongroupexercise',
            name='exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
        migrations.AlterField(
            model_name='plansessiongroupprogressionstrategy',
            name='exercise',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
        migrations.AlterField(
            model_name='plansessiongroupprogressionstrategy',
            name='force',
            field=models.CharField(choices=[('p', 'Pull'), ('q', 'Push'), ('s', 'Static')], max_length=1, null=True),
        ),
        migrations.AlterField(
            model_name='plansessiongroupwarmup',
            name='exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
        migrations.AlterField(
            model_name='plansessionprogressionstrategy',
            name='exercise',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
        migrations.AlterField(
            model_name='plansessionprogressionstrategy',
            name='force',
            field=models.CharField(choices=[('p', 'Pull'), ('q', 'Push'), ('s', 'Static')], max_length=1, null=True),
        ),
        migrations.AlterField(
            model_name='workoutset',
            name='exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
        migrations.AlterField(
            model_name='workoutwarmup',
            name='exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workouts.Exercise'),
        ),
    ]