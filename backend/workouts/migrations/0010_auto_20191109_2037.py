# Generated by Django 2.2.5 on 2019-11-09 20:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0008_unit_unitconversion_workout_workoutset'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='plansessionexercise',
            name='plan_session',
        ),
        migrations.AddField(
            model_name='plansessionexercise',
            name='is_warmup',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='plansessionexercise',
            name='working_weight_percentage',
            field=models.DecimalField(decimal_places=3, default=0, max_digits=6),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='unitconversion',
            name='ratio',
            field=models.DecimalField(decimal_places=9, max_digits=12),
        ),
        migrations.CreateModel(
            name='PlanSessionGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField()),
                ('name', models.CharField(max_length=200)),
                ('plan_session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='groups', to='workouts.PlanSession')),
            ],
        ),
        migrations.AddField(
            model_name='plansessionexercise',
            name='plan_session_group',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='exercises', to='workouts.PlanSessionGroup'),
            preserve_default=False,
        ),
    ]