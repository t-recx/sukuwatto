# Generated by Django 3.0.2 on 2020-02-05 18:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0008_auto_20200205_1726'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='comment_target_object_id',
            field=models.CharField(db_index=True, max_length=255),
        ),
    ]
