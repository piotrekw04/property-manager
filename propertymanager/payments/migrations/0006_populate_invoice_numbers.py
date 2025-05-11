from django.db import migrations
from django.utils import timezone

def gen_invoice_numbers(apps, schema_editor):
    Payment = apps.get_model('payments', 'Payment')
    for p in Payment.objects.filter(invoice_number__isnull=True):
        prefix = timezone.now().strftime('INV%Y%m')
        p.invoice_number = f"{prefix}-{p.pk}"
        p.invoice_date = timezone.now().date()
        p.save()

class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0005_alter_payment_invoice_number'),
    ]

    operations = [
        migrations.RunPython(gen_invoice_numbers, reverse_code=migrations.RunPython.noop),
    ]
