# Generated by Django 3.0.5 on 2020-06-27 17:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0004_metabolicequivalenttask'),
    ]

    operations = [
        migrations.AlterField(
            model_name='metabolicequivalenttask',
            name='exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mets', to='workouts.Exercise'),
        ),
    ]
