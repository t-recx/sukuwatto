# Generated by Django 2.2.5 on 2019-11-15 21:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0022_auto_20191115_1702'),
    ]

    operations = [
        migrations.AddField(
            model_name='workout',
            name='name',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workout',
            name='notes',
            field=models.TextField(null=True),
        ),
    ]
