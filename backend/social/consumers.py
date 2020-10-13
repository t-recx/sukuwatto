from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from channels.generic.websocket import WebsocketConsumer
from social.models import Message
from social.message_service import MessageService
import json

class ChatConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_service = MessageService()

    def connect(self):
        if self.scope["user"].is_anonymous:
            self.close()

            return

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
        self.user1_room_name = user1
        self.user2_room_name = user2

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
        data_type = text_data_json['type']
        uuid = text_data_json['uuid']

        if data_type == 'chat_message':
            message = text_data_json['message']
            date = text_data_json['date']

            # Send message to room group
            self.send_data(
                {
                    'type': 'chat_message',
                    'from_user': self.scope["user"].id,
                    'date': date,
                    'uuid': uuid,
                    'message': message
                }
            )

            self.message_service.create(self.scope["user"], self.correspondent, message, uuid)
        elif data_type == 'edit_message':
            message = text_data_json['message']
            date = text_data_json['date']
            edited_date = text_data_json['edited_date']

            # Send message to room group
            self.send_data(
                {
                    'type': 'edit_message',
                    'from_user': self.scope["user"].id,
                    'date': date,
                    'edited_date': edited_date,
                    'uuid': uuid,
                    'message': message
                }
            )

            self.message_service.update(self.scope["user"], self.correspondent, message, uuid)
        elif data_type == 'delete_message':
            self.send_data(
                {
                    'type': 'delete_message',
                    'uuid': uuid
                }
            )

            self.message_service.delete(self.scope["user"], uuid)

    def send_data(self, data):
        async_to_sync(self.channel_layer.group_send)(
            self.room_name, data
        )

        if self.scope["user"].username != self.user1_room_name:
            async_to_sync(self.channel_layer.group_send)(
                self.user1_room_name, data
            )

        if self.scope["user"].username != self.user2_room_name:
            async_to_sync(self.channel_layer.group_send)(
                self.user2_room_name, data
            )

    # Receive message from room group
    def chat_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))

    # Receive message from room group
    def edit_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))

    # Receive message from room group
    def delete_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))

class FeedConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def connect(self):
        if self.scope["user"].is_anonymous:
            self.close()

            return

        username = self.scope['url_route']['kwargs']['user']

        if self.scope["user"].username != username:
            self.close() # not allowed to use this room

            return

        self.room_name = username

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

    # Receive message from room group
    def chat_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))

    # Receive message from room group
    def edit_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))

    # Receive message from room group
    def delete_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))