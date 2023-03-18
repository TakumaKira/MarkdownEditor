from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if self.active_connections.get(user_id) == None:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        self.active_connections[user_id].remove(websocket)
        if self.active_connections[user_id].count == 0:
            self.active_connections[user_id] = None

    async def send_message(self, message: str, user_id: int):
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_json({"message": message})
            except WebSocketDisconnect:
                self.disconnect(connection)


manager = ConnectionManager()
