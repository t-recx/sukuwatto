# Generated by Django 3.0.5 on 2021-04-27 04:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0024_remove_report_target_user_bio_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='target_comment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_target_comment', to='social.Comment'),
        ),
    ]
