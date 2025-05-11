"""
ASGI config for propertymanager project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

# 1) Ustawiamy zmienne środowiskowe _przed_ jakąkolwiek importacją Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'propertymanager.settings')

# 2) Ręczne odpalenie setupu Django
import django
django.setup()

# 3) Teraz możemy importować wszystko bez błędów
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import messaging.routing

application = ProtocolTypeRouter({
    "http":  get_asgi_application(),
    "websocket": URLRouter(
        messaging.routing.websocket_urlpatterns
    ),
})



