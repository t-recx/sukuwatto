# Generated by Django 3.0.5 on 2021-04-18 02:25

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0041_remove_customuser_language'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user_file', to=settings.AUTH_USER_MODEL),
        ),
    ]