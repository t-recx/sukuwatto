# Generated by Django 3.0.5 on 2020-10-30 15:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('development', '0007_auto_20201030_1542'),
    ]

    operations = [
        migrations.AlterField(
            model_name='release',
            name='version',
            field=models.CharField(default=1, max_length=200),
            preserve_default=False,
        ),
    ]