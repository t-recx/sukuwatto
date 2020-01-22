from sqtrex.token_auth_middleware import TokenAuthMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter
import social.routing

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': TokenAuthMiddleware(
        URLRouter(
            social.routing.websocket_urlpatterns
        )
    ),
})