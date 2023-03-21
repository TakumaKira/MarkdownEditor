import os
from fastapi.testclient import TestClient

from app.main import app


def test_websocket():
    client = TestClient(app)
    with client.websocket_connect("/ws", headers={"x-auth-token": os.environ.get("VALID_AUTH_TOKEN")}) as websocket:
        client.get(
            # TODO: Remove parameter
            "/api/documents?user_id=365",
            headers={"x-auth-token": os.environ.get("VALID_AUTH_TOKEN")}
        )
        data = websocket.receive_json()
        assert data == {"message": "Documents sent."}
