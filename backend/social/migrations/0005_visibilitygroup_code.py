# Generated by Django 3.0.5 on 2020-07-29 01:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0004_visibilitygroup'),
    ]

    operations = [
        migrations.AddField(
            model_name='visibilitygroup',
            name='code',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
