from datetime import timedelta
from django.utils import timezone
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from properties.models import Property
from leases.models import Lease
from payments.models import Payment
from messaging.models import Message

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Statystyki
        total_properties = Property.objects.filter(owner=user).count()
        active_leases    = Lease.objects.filter(property__owner=user, status='active').count()
        pending_leases   = Lease.objects.filter(tenant=user, is_confirmed=False).count()

        # 2. Zakres dat
        today = timezone.now().date()
        upcoming_end = today + timedelta(days=7)

        # 2a. Płatności, które JA muszę zapłacić jako NAJEMCA
        tenant_qs = Payment.objects.filter(
            lease__tenant=user,
            date__range=(today, upcoming_end)
        ).order_by('date')[:3]
        upcoming_tenant = [
            {
                'date': p.date,
                'property': p.lease.property.name,
                'counterparty': p.lease.property.owner.username,
                'amount': p.amount
            }
            for p in tenant_qs
        ]

        # 2b. Płatności, które mam odebrać jako WŁAŚCICIEL
        owner_qs = Payment.objects.filter(
            lease__property__owner=user,
            date__range=(today, upcoming_end)
        ).order_by('date')[:3]
        upcoming_owner = [
            {
                'date': p.date,
                'property': p.lease.property.name,
                'counterparty': p.lease.tenant.username,
                'amount': p.amount
            }
            for p in owner_qs
        ]

        # 3. Ostatnie 3 wiadomości
        msgs_qs = Message.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        ).order_by('-timestamp')[:3]
        last_messages = [
            {
                'sender': msg.sender.username,
                'content': msg.content,
                'timestamp': msg.timestamp
            }
            for msg in msgs_qs
        ]

        return Response({
            'stats': {
                'total_properties': total_properties,
                'active_leases': active_leases,
                'pending_leases': pending_leases,
            },
            'upcoming_tenant': upcoming_tenant,
            'upcoming_owner': upcoming_owner,
            'last_messages': last_messages
        })
