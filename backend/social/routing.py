from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path(r'ws/chat/<str:user>/<str:correspondent>/', consumers.ChatConsumer),
    path(r'ws/feed/<str:user>/', consumers.FeedConsumer),
]