# Generated by Django 3.0.5 on 2021-01-02 20:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_customuser_tier'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='tier',
            field=models.CharField(choices=[('n', 'Novice'), ('i', 'Intermediate'), ('a', 'Advanced')], default='n', max_length=1),
        ),
    ]
