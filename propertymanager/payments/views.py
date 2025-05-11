import os
from django.db import models
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.template.loader import render_to_string
import pdfkit
from django.http import HttpResponse
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer


class PaymentListCreate(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(
            models.Q(lease__tenant=user) |
            models.Q(lease__property__owner=user)
        )


class PaymentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(
            models.Q(lease__tenant=user) |
            models.Q(lease__property__owner=user)
        )

    def update(self, request, *args, **kwargs):
        payment = self.get_object()
        if payment.lease.property.owner != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do edycji tej płatności.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        payment = self.get_object()
        if payment.lease.property.owner != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do usunięcia tej płatności.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    
class InvoicePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            payment = Payment.objects.select_related(
                'lease__property__owner',
                'lease__tenant',
                'lease__property'
            ).get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'detail': 'Nie znaleziono płatności.'}, status=404)

        # sprawdź, czy to tenant lub owner
        user = request.user
        if not (user == payment.lease.property.owner or user == payment.lease.tenant):
            return Response({'detail': 'Brak dostępu.'}, status=403)

        # upewnij się, że invoice_number ma wartość
        if not payment.invoice_number:
            payment.save()

        # render HTML
        html = render_to_string('payments/invoice.html', {
            'payment': payment,
            'lease': payment.lease,
            'property': payment.lease.property,
            'owner': payment.lease.property.owner,
            'tenant': payment.lease.tenant,
        })

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        bin_name = 'wkhtmltopdf.exe' if os.name == 'nt' else 'wkhtmltopdf'
        bin_path = os.path.join(base_dir, 'bin', bin_name)

        if not os.path.isfile(bin_path):
            # dodatkowo możesz zalogować lub rzucić czytelny błąd
            raise IOError(f"Nie znalazłem wkhtmltopdf pod ścieżką: {bin_path}")
        config = pdfkit.configuration(wkhtmltopdf=bin_path)
        pdf = pdfkit.from_string(html, False, configuration=config)

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="faktura_{payment.invoice_number}.pdf"'
        return response
