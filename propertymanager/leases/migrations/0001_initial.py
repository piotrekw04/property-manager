# Generated by Django 5.2 on 2025-05-02 14:01

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('properties', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Lease',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('rent_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('payment_due_day', models.PositiveIntegerField(default=10, help_text='Dzień miesiąca, kiedy płatność jest należna (1-31)')),
                ('is_confirmed', models.BooleanField(default=False)),
                ('agreement_signed_in_person', models.BooleanField(default=False)),
                ('needs_signature', models.BooleanField(default=False)),
                ('is_signed', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('pending', 'Oczekujący'), ('active', 'Aktywny'), ('waiting_signature', 'Oczekuje na podpisanie umowy')], default='pending', max_length=20)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='properties.property')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
