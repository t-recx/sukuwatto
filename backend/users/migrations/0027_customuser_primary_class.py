# Generated by Django 3.0.5 on 2021-01-10 22:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_remove_customuser_primary_class'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='primary_class',
            field=models.CharField(default='Athlete', max_length=200, null=True),
        ),
    ]
