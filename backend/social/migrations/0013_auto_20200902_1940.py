# Generated by Django 3.0.5 on 2020-09-02 19:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0012_useraction'),
    ]

    operations = [
        migrations.AddField(
            model_name='useraction',
            name='action_object_comment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='action_object_comment', to='social.Comment'),
        ),
        migrations.AddField(
            model_name='useraction',
            name='target_comment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='target_comment', to='social.Comment'),
        ),
    ]
