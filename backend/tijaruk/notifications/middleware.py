import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)
User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_key):
    try:
        token = AccessToken(token_key)
        user = User.objects.get(id=token['user_id'])
        logger.debug("WS auth OK — user_id=%s email=%s", user.id, user.email)
        return user
    except TokenError as exc:
        logger.warning("WS auth FAILED — token error: %s", exc)
        return AnonymousUser()
    except User.DoesNotExist:
        logger.warning("WS auth FAILED — user not found for token payload")
        return AnonymousUser()
    except Exception as exc:
        logger.warning("WS auth FAILED — unexpected error: %s", exc)
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query = parse_qs(scope['query_string'].decode())
        token = query.get('token', [None])[0]
        logger.debug("WS handshake — path=%s token_present=%s", scope.get('path'), bool(token))
        scope['user'] = await get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)
