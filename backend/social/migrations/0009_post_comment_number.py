# Generated by Django 3.0.5 on 2020-08-27 13:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0008_post_likes'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='comment_number',
            field=models.IntegerField(default=0),
        ),
    ]
