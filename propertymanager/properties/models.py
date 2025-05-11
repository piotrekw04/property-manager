from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Property(models.Model):
    PROPERTY_TYPES = [
        ('flat', 'Mieszkanie'),
        ('house', 'Dom'),
        ('commercial', 'Lokal usługowy'),
    ]

    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    area = models.FloatField(help_text="Powierzchnia w m²")
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    rooms = models.PositiveIntegerField(default=1, help_text="Liczba pokoi")
    description = models.TextField(blank=True)
    is_furnished = models.BooleanField(default=False, help_text="Czy umeblowane?")
    is_rented = models.BooleanField(default=False) 
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    @property
    def is_currently_rented(self):
        today = timezone.now().date()
        return self.lease_set.filter(
            is_confirmed=True,
            start_date__lte=today,
            end_date__gte=today
        ).exists()

    @property
    def is_future_rented(self):
        today = timezone.now().date()
        return self.lease_set.filter(
            is_confirmed=True,
            start_date__gt=today
        ).exists()