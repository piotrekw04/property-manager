import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from rest_framework_simplejwt.tokens import AccessToken

        params = parse_qs(self.scope['query_string'].decode())
        token = params.get('token')
        if not token:
            return await self.close()

        try:
            valid_data = AccessToken(token[0])
            user_id = valid_data['user_id']
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except Exception:
            return await self.close()

        contact_id = self.scope['url_route']['kwargs']['contact_id']
        self.room_name = f"chat_{min(self.user.id, int(contact_id))}_{max(self.user.id, int(contact_id))}"
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')

        # Zapisz wiadomość w bazie
        msg = await database_sync_to_async(Message.objects.create)(
            sender=self.user,
            recipient_id=self.scope['url_route']['kwargs']['contact_id'],
            content=message
        )

        # Rozgłoś w pokoju czatu
        event = {
            'type': 'chat_message',
            'message': message,
            'sender_id': self.user.id,
            'timestamp': msg.timestamp.isoformat()
        }
        await self.channel_layer.group_send(self.room_name, event)

        # Powiadom odbiorcę o nowej wiadomości
        await self.channel_layer.group_send(
            f"notifications_{msg.recipient_id}",
            {
                'type': 'new_message',
                'sender_id': self.user.id,
                'sender_username': self.user.username,
                'last_message': msg.content,
                'timestamp': msg.timestamp.isoformat(),
            }
        )

        # Pobierz asynchronicznie dane drugiej strony
        recipient_user = await database_sync_to_async(User.objects.get)(id=msg.recipient_id)

        # Powiadom też nadawcę, by od razu dorzucił kontakt
        await self.channel_layer.group_send(
            f"notifications_{self.user.id}",
            {
                'type': 'new_message',
                'sender_id': msg.recipient_id,
                'sender_username': recipient_user.username,
                'last_message': msg.content,
                'timestamp': msg.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp']
        }))

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from rest_framework_simplejwt.tokens import AccessToken

        params = parse_qs(self.scope['query_string'].decode())
        token = params.get('token')
        if not token:
            return await self.close()

        try:
            valid_data = AccessToken(token[0])
            user_id = valid_data['user_id']
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except Exception:
            return await self.close()

        self.group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def new_message(self, event):
        await self.send(text_data=json.dumps(event))
