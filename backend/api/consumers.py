import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    online_users = set()

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'PubChat_{self.room_name}'
        self.username = self.scope['query_string'].decode().split('username=')[-1]  # Extract username from query string

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Add user to the set of online users
        ChatConsumer.online_users.add(self.username)

        # Notify the group of the new user and send the current online users list to the new user
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'username': self.username,
                'online_users': list(ChatConsumer.online_users)
            }
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Remove user from the set of online users
        if self.username in ChatConsumer.online_users:
            ChatConsumer.online_users.remove(self.username)

        # Notify the group of the user leaving
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'username': self.username
            }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = text_data_json.get('sender', 'Anonymous')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))

    async def user_joined(self, event):
        username = event['username']
        online_users = event['online_users']

        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'username': username,
            'online_users': online_users
        }))

    async def user_left(self, event):
        username = event['username']

        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'username': username
        }))
