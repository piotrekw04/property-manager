from django.shortcuts import render
from rest_framework import generics
from leases.models import Lease
from messaging.models import Message
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import models
from rest_framework.decorators import api_view


class ContactListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Użytkownicy z wynajmu
        leases = Lease.objects.filter(models.Q(property__owner=user) | models.Q(tenant=user))
        related_users = set()
        for lease in leases:
            related_users.add(lease.tenant)
            related_users.add(lease.property.owner)

        # 2. Użytkownicy z wiadomości
        message_contacts = Message.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        )
        for message in message_contacts:
            related_users.add(message.sender)
            related_users.add(message.recipient)

        related_users.discard(user)  # Usuń siebie samego

        users = User.objects.filter(id__in=[u.id for u in related_users])

        response_data = []
        for contact in users:
            # Pobierz ostatnią wiadomość między użytkownikiem a kontaktem
            last_msg = Message.objects.filter(
                (models.Q(sender=user, recipient=contact) | models.Q(sender=contact, recipient=user))
            ).order_by('-timestamp').first()

            has_unread = Message.objects.filter(
                sender=contact,
                recipient=user,
                is_read=False
            ).exists()

            response_data.append({
                "id": contact.id,
                "username": contact.username,
                "last_message": last_msg.content if last_msg else '',
                "hasUnread": has_unread
            })

        return Response(response_data)
    
    
@api_view(['GET'])
def message_thread(request, contact_id):
    user = request.user
    try:
        contact = User.objects.get(id=contact_id)
    except User.DoesNotExist:
        return Response({"error": "Użytkownik nie istnieje."}, status=404)

    messages = Message.objects.filter(
        (models.Q(sender=user) & models.Q(recipient=contact)) |
        (models.Q(sender=contact) & models.Q(recipient=user))
    ).order_by('timestamp')

    Message.objects.filter(
        sender=contact, recipient=user, is_read=False
    ).update(is_read=True)

    serialized_messages = [
        {
            "id": msg.id,
            "sender_name": msg.sender.username,
            "content": msg.content,
            "timestamp": msg.timestamp
        }
        for msg in messages
    ]

    return Response({
        "contact_name": contact.username,
        "messages": serialized_messages
    })
    
    
@api_view(['GET'])
def search_user(request):
    username = request.query_params.get('username')
    if not username:
        return Response({"error": "Brak nazwy użytkownika."}, status=400)
    
    try:
        user = User.objects.get(username=username)
        if user == request.user:
            return Response({"error": "Nie możesz wysłać wiadomości do siebie."}, status=400)
        
        return Response({"id": user.id, "username": user.username})
    except User.DoesNotExist:
        return Response({"error": "Nie znaleziono użytkownika."}, status=404)


@api_view(['POST'])
def send_message(request):
    sender = request.user
    recipient_id = request.data.get('recipient')
    content = request.data.get('content')

    if not recipient_id or not content:
        return Response({"error": "Brak odbiorcy lub treści."}, status=400)

    try:
        recipient = User.objects.get(id=recipient_id)
    except User.DoesNotExist:
        return Response({"error": "Odbiorca nie istnieje."}, status=404)

    if recipient == sender:
        return Response({"error": "Nie możesz wysłać wiadomości do siebie."}, status=400)

    message = Message.objects.create(
        sender=sender,
        recipient=recipient,
        content=content,
        is_read=False
    )

    return Response({
        "id": message.id,
        "sender": message.sender.username,
        "recipient": message.recipient.username,
        "content": message.content,
        "timestamp": message.timestamp
    }, status=201)


@api_view(['GET'])
def contact_list_with_last_message(request):
    user = request.user
    leases = Lease.objects.filter(models.Q(property__owner=user) | models.Q(tenant=user))
    related_users = set()
    for lease in leases:
        related_users.add(lease.tenant)
        related_users.add(lease.property.owner)

    message_contacts = Message.objects.filter(
        models.Q(sender=user) | models.Q(recipient=user)
    )
    for message in message_contacts:
        related_users.add(message.sender)
        related_users.add(message.recipient)

    related_users.discard(user)

    users = User.objects.filter(id__in=[u.id for u in related_users])

    data = []
    for contact in users:
        last_message = Message.objects.filter(
            (models.Q(sender=user, recipient=contact) | models.Q(sender=contact, recipient=user))
        ).order_by('-timestamp').first()

        has_unread = Message.objects.filter(
            sender=contact,
            recipient=user,
            is_read=False
        ).exists()

        data.append({
            "id": contact.id,
            "username": contact.username,
            "last_message": last_message.content if last_message else "",
            "last_message_time": last_message.timestamp if last_message else None,
            "hasUnread": has_unread 
        })

    return Response(data)