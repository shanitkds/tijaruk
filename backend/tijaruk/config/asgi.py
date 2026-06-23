import os

import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')

django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from notifications.middleware import JWTAuthMiddleware
from notifications.routing import websocket_urlpatterns
from django.conf import settings

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})

# Wrap with WhiteNoise only when STATIC_ROOT exists (i.e. after collectstatic)
if settings.STATIC_ROOT and settings.STATIC_ROOT.exists():
    from whitenoise import WhiteNoise
    application = WhiteNoise(application, root=str(settings.STATIC_ROOT), prefix='static')
