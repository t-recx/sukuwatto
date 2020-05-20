# Generated by Django 2.2.5 on 2019-12-01 16:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_customuser_system'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='system',
            field=models.CharField(choices=[('m', 'Metric'), ('i', 'Imperial')], default='m', max_length=1),
            preserve_default=False,
        ),
    ]