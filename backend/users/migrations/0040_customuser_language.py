# Generated by Django 3.0.5 on 2021-04-11 21:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0039_auto_20210220_1804'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='language',
            field=models.CharField(default='en', max_length=20, null=True),
        ),
    ]
