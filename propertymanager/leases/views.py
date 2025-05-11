import os
from .serializers import LeaseSerializer
from .models import Lease
from messaging.models import Message
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import calendar
from payments.models import Payment
from datetime import date
from rest_framework.views import APIView
from django.http import HttpResponse
from django.template.loader import render_to_string
import pdfkit


class LeaseListCreate(generics.ListCreateAPIView):
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        lease_type = self.request.query_params.get('type')

        if lease_type == 'rented':
            return Lease.objects.filter(tenant=user, is_confirmed=True)
        elif lease_type == 'owned':
            return Lease.objects.filter(property__owner=user)
        else:
            return Lease.objects.filter(
                (models.Q(tenant=user) | models.Q(property__owner=user)),
                is_confirmed=True
            )

    def perform_create(self, serializer):
        lease_data = serializer.validated_data
        property = lease_data['property']
        tenant = lease_data['tenant']
        start_date = lease_data['start_date']
        end_date = lease_data['end_date']

        # Sprawdzenie czy najemca nie wynajmuje już tej nieruchomości w tym okresie
        overlapping_lease = Lease.objects.filter(
            property=property,
            tenant=tenant,
            start_date__lte=end_date,
            end_date__gte=start_date
        ).exists()

        if overlapping_lease:
            raise ValidationError("Najemca już wynajmuje tę nieruchomość w podanym okresie.")

        lease = serializer.save()
        
        Message.objects.create(
            sender=self.request.user,
            recipient=lease.tenant,
            content=f"Zostałeś dodany jako najemca nieruchomości '{lease.property.name}'. Potwierdź lub odrzuć najem w zakładce 'Moje wynajmy'."
        )
        
        
class LeaseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Najemca lub właściciel nieruchomości
        return Lease.objects.filter(models.Q(tenant=user) | models.Q(property__owner=user))
    
    def destroy(self, request, *args, **kwargs):
        lease = self.get_object()

        # Tylko właściciel może anulować wynajem
        if lease.property.owner != request.user:
            return Response({'detail': 'Nie masz uprawnień do anulowania tego wynajmu.'}, status=status.HTTP_403_FORBIDDEN)

        # Wysyłamy wiadomość do najemcy
        Message.objects.create(
            sender=request.user,
            recipient=lease.tenant,
            content=f"Właściciel {request.user.username} anulował wynajem nieruchomości: {lease.property.name}."
        )

        return super().destroy(request, *args, **kwargs)       
        
       
class AgreementPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # 1) Pobierz umowę i sprawdź uprawnienia
        try:
            lease = Lease.objects.get(pk=pk)
        except Lease.DoesNotExist:
            return Response({'detail': 'Nie znaleziono umowy.'}, status=404)

        if not (lease.property.owner == request.user or lease.tenant == request.user):
            return Response({'detail': 'Brak dostępu.'}, status=403)

        # 2) Render HTML
        html_string = render_to_string('leases/agreement.html', {'lease': lease})

        # 3) Ścieżka do binarki wkhtmltopdf
        #    bazując na strukturze projektu:
        bin_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                'bin', 'wkhtmltopdf')
        # jeżeli Windows, może być 'wkhtmltopdf.exe':
        if os.name == 'nt':
            bin_path += '.exe'

        # 4) Konfiguracja pdfkit
        config = pdfkit.configuration(wkhtmltopdf=bin_path)

        # 5) Generacja PDF z HTML
        pdf = pdfkit.from_string(html_string, False, configuration=config)

        # 6) Zwróć PDF jako attachment
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="umowa_{lease.id}.pdf"'
        return response

 
@api_view(['GET'])
def pending_leases(request):
    user = request.user
    leases = Lease.objects.filter(tenant=user, is_confirmed=False)

    serializer = LeaseSerializer(leases, many=True)

    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_lease(request, lease_id):
    try:
        lease = Lease.objects.get(id=lease_id, tenant=request.user)
    except Lease.DoesNotExist:
        return Response({"error": "Nie znaleziono wynajmu."}, status=404)

    if lease.is_confirmed:
        return Response({"error": "Wynajem już został potwierdzony."}, status=400)

    lease.is_confirmed = True

    if lease.needs_signature:
        lease.status = 'waiting_signature'
    else:
        lease.status = 'active'
        # TYLKO TERAZ tworzymy płatności
        start = lease.start_date
        end = lease.end_date
        payment_day = lease.payment_due_day
        current_year = start.year
        current_month = start.month
        while True:
            max_day = calendar.monthrange(current_year, current_month)[1]
            day = min(payment_day, max_day)
            payment_date = date(current_year, current_month, day)
            if date(current_year, current_month, 1) > end:
                break
            Payment.objects.create(
                lease=lease,
                amount=lease.rent_amount,
                date=payment_date,
                is_paid=False
            )
            if current_month == 12:
                current_year += 1
                current_month = 1
            else:
                current_month += 1

    lease.save()

    # wiadomość do właściciela
    Message.objects.create(
        sender=request.user,
        recipient=lease.property.owner,
        content=f"Użytkownik {request.user.username} zaakceptował wynajem nieruchomości: {lease.property.name}."
    )

    return Response({"status": "success", "message": "Wynajem potwierdzony."})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_lease(request, lease_id):
    try:
        lease = Lease.objects.get(id=lease_id, tenant=request.user)
    except Lease.DoesNotExist:
        return Response({"error": "Nie znaleziono wynajmu."}, status=404)

    if lease.status != 'pending':
        return Response({"error": "Ten wynajem nie oczekuje na potwierdzenie."}, status=400)

    # Wyślij wiadomość do właściciela
    Message.objects.create(
        sender=request.user,
        recipient=lease.property.owner,
        content=f"Użytkownik {request.user.username} odrzucił wynajem nieruchomości: {lease.property.name}."
    )

    lease.delete()

    return Response({"status": "success", "message": "Wynajem odrzucony."})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_pending_lease(request, lease_id):
    try:
        lease = Lease.objects.get(id=lease_id, property__owner=request.user)
    except Lease.DoesNotExist:
        return Response({"error": "Nie znaleziono wynajmu lub brak uprawnień."}, status=404)

    if lease.status != 'pending':
        return Response({"error": "Wynajem nie jest już w stanie oczekiwania."}, status=400)

    # Wyślij wiadomość do najemcy o anulowaniu
    Message.objects.create(
        sender=request.user,
        recipient=lease.tenant,
        content=f"Właściciel {request.user.username} anulował wynajem nieruchomości: {lease.property.name}."
    )

    lease.delete()

    return Response({"status": "success", "message": "Wynajem został anulowany."})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_lease(request, lease_id):
    """
    Najemca klika -> oznacz umowę jako podpisaną i ustaw status active,
    a jeśli nie było jeszcze generacji płatności, zrób to teraz.
    """
    try:
        lease = Lease.objects.get(id=lease_id, tenant=request.user)
    except Lease.DoesNotExist:
        return Response({"error": "Nie znaleziono Twojej umowy."}, status=status.HTTP_404_NOT_FOUND)

    # Tylko w stanie oczekiwania na podpis
    if lease.status != 'waiting_signature':
        return Response({"error": "Umowa nie wymaga podpisu lub już została podpisana."}, status=status.HTTP_400_BAD_REQUEST)

    # Oznacz podpisane
    lease.is_signed = True
    lease.status = 'active'

    # Wygeneruj płatności tak jak w confirm_lease
    start = lease.start_date
    end = lease.end_date
    payment_day = lease.payment_due_day
    current_year = start.year
    current_month = start.month

    from .models import Payment  # aby uniknąć circular importu
    while True:
        max_day = calendar.monthrange(current_year, current_month)[1]
        day = min(payment_day, max_day)
        payment_date = date(current_year, current_month, day)
        # jeśli pierwszy dzień miesiąca > end_date, przerwij
        if date(current_year, current_month, 1) > end:
            break
        Payment.objects.create(
            lease=lease,
            title=f"Czynsz za {lease.property.name} {current_year}-{current_month:02d}",
            description="",
            amount=lease.rent_amount,
            date=payment_date,
            is_paid=False
        )
        if current_month == 12:
            current_year += 1
            current_month = 1
        else:
            current_month += 1

    lease.save()
    return Response({"status": "success", "message": "Umowa została podpisana i aktywowana."})