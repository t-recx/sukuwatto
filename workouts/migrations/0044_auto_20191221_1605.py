# Generated by Django 2.2.5 on 2019-12-21 16:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0043_userbiodata_bone_mass_weight'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userbiodata',
            name='body_fat_percentage',
            field=models.DecimalField(decimal_places=3, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='userbiodata',
            name='muscle_mass_percentage',
            field=models.DecimalField(decimal_places=3, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='userbiodata',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='userbiodata',
            name='water_weight_percentage',
            field=models.DecimalField(decimal_places=3, max_digits=6, null=True),
        ),
    ]
