from django.db import models
from django.contrib.auth.models import User
from properties.models import Property

class Lease(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Oczekujący'),
        ('active', 'Aktywny'),
        ('waiting_signature', 'Oczekuje na podpisanie umowy'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    tenant = models.ForeignKey(User, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_due_day = models.PositiveIntegerField(default=10, help_text="Dzień miesiąca, kiedy płatność jest należna (1-31)")
    
    is_confirmed = models.BooleanField(default=False)  # czy najemca zaakceptował wynajem
    agreement_signed_in_person = models.BooleanField(default=False)  # czy podpisano na miejscu
    needs_signature = models.BooleanField(default=False)  # czy wymagane podpisanie elektroniczne
    is_signed = models.BooleanField(default=False)  # czy podpis elektroniczny został wykonany
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Lease for {self.property} by {self.tenant}"