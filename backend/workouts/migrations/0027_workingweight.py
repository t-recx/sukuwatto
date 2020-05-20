# Generated by Django 2.2.5 on 2019-11-18 23:49

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('workouts', '0026_auto_20191116_1648'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkingWeight',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField()),
                ('weight', models.DecimalField(decimal_places=2, max_digits=6)),
                ('exercise', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workouts.Exercise')),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workouts.Unit')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]