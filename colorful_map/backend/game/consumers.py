import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import timedelta
from .models import Block

# Simple in-memory storage for cooldowns
# { username: timestamp }
USER_LAST_ACTION = {}
COOLDOWN_SECONDS = 0.5
LOCK_SECONDS = 3.0

# Track connected users (approximate for single-process)
CONNECTED_USERS = 0

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global CONNECTED_USERS
        self.room_group_name = "game_map"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Increment and broadcast
        CONNECTED_USERS += 1
        await self.broadcast_user_count()

    async def disconnect(self, close_code):
        global CONNECTED_USERS
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Decrement and broadcast
        CONNECTED_USERS = max(0, CONNECTED_USERS - 1)
        await self.broadcast_user_count()

    async def broadcast_user_count(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_count",
                "count": CONNECTED_USERS
            }
        )

    async def user_count(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_count",
            "count": event["count"]
        }))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action")

            if action == "capture":
                x = data.get("x")
                y = data.get("y")
                color = data.get("color")
                username = data.get("username", "Anonymous")
                
                if x is not None and y is not None and color:
                    # Check Global Cooldown
                    now = time.time()
                    last_user_action = USER_LAST_ACTION.get(username, 0)
                    if now - last_user_action < COOLDOWN_SECONDS:
                        # Send error
                        await self.send(text_data=json.dumps({
                            "type": "error",
                            "message": f"Cooldown! Wait {COOLDOWN_SECONDS}s."
                        }))
                        return

                    # Check Block Lock
                    can_capture = await self.check_block_lock(x, y)
                    if not can_capture:
                         await self.send(text_data=json.dumps({
                            "type": "error",
                            "message": "Block is locked!"
                        }))
                         return
                    
                    # Update DB
                    await self.save_block(x, y, color, username)
                    
                    # Update memory for cooldowns
                    USER_LAST_ACTION[username] = now
                    
                    # Broadcast to room
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "block_update",
                            "x": x,
                            "y": y,
                            "color": color,
                            "owner_name": username
                        }
                    )
        except Exception as e:
            print(f"Error processing message: {e}")

    @database_sync_to_async
    def check_block_lock(self, x, y):
        # Allow if block doesn't exist or last_updated is old enough
        try:
            block = Block.objects.get(x=x, y=y)
            if timezone.now() - block.last_updated < timedelta(seconds=LOCK_SECONDS):
                 return False
            return True
        except Block.DoesNotExist:
            return True

    @database_sync_to_async
    def save_block(self, x, y, color, owner_name):
        Block.objects.update_or_create(
            x=x, y=y,
            defaults={"color": color, "owner_name": owner_name}
        )

    async def block_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": "update",
            "x": event["x"],
            "y": event["y"],
            "color": event["color"],
            "owner_name": event.get("owner_name")
        }))
