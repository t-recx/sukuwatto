# Generated by Django 2.2.4 on 2020-02-15 17:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0010_post_edited_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='edited_date',
            field=models.DateTimeField(null=True),
        ),
    ]