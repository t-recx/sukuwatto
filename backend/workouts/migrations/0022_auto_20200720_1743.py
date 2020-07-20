# Generated by Django 3.0.5 on 2020-07-20 17:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0021_auto_20200720_1728'),
    ]

    operations = [
        migrations.AddField(
            model_name='planprogressionstrategy',
            name='initial_value_unit',
            field=models.IntegerField(choices=[(1, 'Kilogram'), (2, 'Pound'), (3, 'Centimeter'), (4, 'Feet'), (5, 'Kilometer'), (6, 'Mile'), (7, 'Minute'), (8, 'Meter'), (9, 'Second'), (10, 'Yard'), (11, 'Kmh'), (12, 'Mph'), (13, 'Millisecond'), (14, 'Hour')], null=True),
        ),
        migrations.AddField(
            model_name='plansessiongroupprogressionstrategy',
            name='initial_value_unit',
            field=models.IntegerField(choices=[(1, 'Kilogram'), (2, 'Pound'), (3, 'Centimeter'), (4, 'Feet'), (5, 'Kilometer'), (6, 'Mile'), (7, 'Minute'), (8, 'Meter'), (9, 'Second'), (10, 'Yard'), (11, 'Kmh'), (12, 'Mph'), (13, 'Millisecond'), (14, 'Hour')], null=True),
        ),
        migrations.AddField(
            model_name='plansessionprogressionstrategy',
            name='initial_value_unit',
            field=models.IntegerField(choices=[(1, 'Kilogram'), (2, 'Pound'), (3, 'Centimeter'), (4, 'Feet'), (5, 'Kilometer'), (6, 'Mile'), (7, 'Minute'), (8, 'Meter'), (9, 'Second'), (10, 'Yard'), (11, 'Kmh'), (12, 'Mph'), (13, 'Millisecond'), (14, 'Hour')], null=True),
        ),
    ]
