# Generated by Django 3.0.5 on 2020-07-20 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0020_auto_20200716_0404'),
    ]

    operations = [
        migrations.AddField(
            model_name='planprogressionstrategy',
            name='initial_value',
            field=models.DecimalField(decimal_places=5, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='plansessiongroupprogressionstrategy',
            name='initial_value',
            field=models.DecimalField(decimal_places=5, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='plansessionprogressionstrategy',
            name='initial_value',
            field=models.DecimalField(decimal_places=5, max_digits=10, null=True),
        ),
    ]