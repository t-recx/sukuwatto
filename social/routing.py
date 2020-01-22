from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path(r'ws/chat/<str:user>/<str:correspondent>/', consumers.ChatConsumer),
]