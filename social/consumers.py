from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from channels.generic.websocket import WebsocketConsumer
from social.models import Message
from social.message_service import MessageService
import json
from pprint import pprint

class ChatConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_service = MessageService()

    def connect(self):
        if self.scope["user"].is_anonymous:
            self.close()

        user1 = self.scope['url_route']['kwargs']['user']
        user2 = self.scope['url_route']['kwargs']['correspondent']

        if self.scope["user"].username not in [user1, user2]:
            self.close() # not allowed to use this room

            return

        correspondent_username = user1

        if user1 == self.scope["user"].username:
            correspondent_username = user2

        self.correspondent = get_user_model().objects.get(username=correspondent_username)

        if self.correspondent is None:
            self.close()

            return

        self.room_name = user1 + '_' + user2

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {
                'type': 'chat_message',
                'from_user': self.scope["user"].id,
                'message': message
            }
        )

        self.message_service.create(self.scope["user"], self.correspondent, message)

    # Receive message from room group
    def chat_message(self, event):
        from_user = event['from_user']
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'from_user': from_user,
            'message': message
        }))
