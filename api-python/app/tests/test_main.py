from fastapi.testclient import TestClient

from app.main import app


def test_read_main():
    client = TestClient(app)

    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "MarkdownEditor API is working."}
