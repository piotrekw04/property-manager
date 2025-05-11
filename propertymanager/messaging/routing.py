from django.urls import re_path
from . import consumers
from .consumers import ChatConsumer, NotificationConsumer

websocket_urlpatterns = [
    # klient połączy się na ws://…/ws/chat/<contact_id>/?token=xxx
    re_path(r'ws/chat/(?P<contact_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$',       NotificationConsumer.as_asgi()),
]
