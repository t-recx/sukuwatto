# Generated by Django 3.0.5 on 2020-08-31 20:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_followerrelationship'),
    ]

    operations = [
        migrations.DeleteModel(
            name='FollowerRelationship',
        ),
    ]
