# Generated by Django 3.0.5 on 2020-09-26 03:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_customuser_default_energy_unit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='default_energy_unit',
            field=models.IntegerField(default=15),
        ),
    ]