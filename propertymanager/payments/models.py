from django.db import models
from django.utils import timezone
from django.db import transaction


class Payment(models.Model):
    lease = models.ForeignKey('leases.Lease', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    title = models.CharField(
        max_length=200,
        help_text="Tytuł płatności, np. 'Czynsz maj 2025'"
    )
    description = models.TextField(
        blank=True,
        help_text="Opis płatności (opcjonalnie)"
    )
    date = models.DateField()
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    invoice_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    invoice_date   = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Płatność {self.id} - {self.amount} zł"
    
    def save(self, *args, **kwargs):
        if self.invoice_number:
            return super().save(*args, **kwargs)

        with transaction.atomic():
            super().save(*args, **kwargs)

            prefix = timezone.now().strftime('INV%Y%m')
            self.invoice_number = f"{prefix}-{self.pk}"
            self.invoice_date = timezone.now().date()

            Payment.objects.filter(pk=self.pk).update(
                invoice_number=self.invoice_number,
                invoice_date=self.invoice_date
            )