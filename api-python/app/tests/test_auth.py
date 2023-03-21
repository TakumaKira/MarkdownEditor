import os
import re
from fastapi.testclient import TestClient
from pytest_mock import MockerFixture
from app.database.base import SessionLocal
from app.database import models
from unittest import mock

from app.main import app


url_pattern_in_html = re.compile(r'href=(?:"|\')?(\S+)(?:"|\')(?:\s|>)')
url_pattern_in_plain_text = re.compile(r'https?://\S+')

# No tests for checking if mailer is working.

MOCK_SENDER_EMAIL="confirm@markdown.com"

MOCK_STANDARD_MAIL_SERVER_HOST="mail.markdown.com"
MOCK_STANDARD_MAIL_SERVER_PORT="465"
MOCK_STANDARD_MAIL_SERVER_USER="no-reply@markdown.com"
MOCK_STANDARD_MAIL_SERVER_PASS="mock_mail_server_password"

@mock.patch.dict(os.environ, {
    "FRONTEND_DOMAIN": "localhost",
    "FRONTEND_PORT": "19006",
    "CONFIRMATION_EMAIL_SERVER_TYPE": "StarndardMailServer",
    "STANDARD_MAIL_SERVER_HOST": MOCK_STANDARD_MAIL_SERVER_HOST,
    "STANDARD_MAIL_SERVER_PORT": MOCK_STANDARD_MAIL_SERVER_PORT,
    "STANDARD_MAIL_SERVER_USER": MOCK_STANDARD_MAIL_SERVER_USER,
    "STANDARD_MAIL_SERVER_PASS": MOCK_STANDARD_MAIL_SERVER_PASS,
    "SENDER_EMAIL": MOCK_SENDER_EMAIL
})
def test_signup_smtp(mocker: MockerFixture):
    client = TestClient(app)

    mock_server = mocker.MagicMock()
    mock_server.login = mocker.MagicMock()
    mock_server.send_message = mocker.MagicMock()
    mock_smtp_class = mocker.patch("app.utils.mailer.smtplib.smtplib.SMTP_SSL")
    mock_smtp_class.return_value.__enter__.return_value = mock_server

    USER_EMAIL = "test@example.com"

    response = client.post(
        "/api/auth/signup",
        json={"email": USER_EMAIL, "password": "testPassword"}
    )
    db = SessionLocal()
    db_user = db.query(models.User).filter(models.User.email == USER_EMAIL)
    assert db_user.count() == 1
    assert db_user.first().email == USER_EMAIL
    assert db_user.first().is_activated == False
    db_user.delete()
    db.commit()
    assert response.status_code == 200
    assert response.json() == {"message": "Confirmation email was sent."}

    assert mock_smtp_class.call_count == 1
    assert mock_smtp_class.call_args[0][0] == MOCK_STANDARD_MAIL_SERVER_HOST
    assert mock_smtp_class.call_args[0][1] == MOCK_STANDARD_MAIL_SERVER_PORT
    assert mock_smtp_class.return_value.__enter__.call_count == 1
    assert mock_smtp_class.return_value.__exit__.call_count == 1
    assert mock_server.login.call_count == 1
    assert mock_server.login.call_args[0][0] == MOCK_STANDARD_MAIL_SERVER_USER
    assert mock_server.login.call_args[0][1] == MOCK_STANDARD_MAIL_SERVER_PASS
    assert mock_server.send_message.call_count == 1
    assert mock_server.send_message.call_args[0][0]["From"] == MOCK_SENDER_EMAIL
    assert mock_server.send_message.call_args[0][0]["To"] == USER_EMAIL
    html_body = mock_server.send_message.call_args[0][0].get_body(preferencelist=('html')).get_content()
    plain_text_body = mock_server.send_message.call_args[0][0].get_body(preferencelist=('plain')).get_content()
    html_urls = url_pattern_in_html.findall(html_body)
    plain_text_urls = url_pattern_in_plain_text.findall(plain_text_body)
    assert html_urls[0] == plain_text_urls[0]


MOCK_SENDGRID_API_KEY = "mock_sendgrid_api_key"

@mock.patch.dict(os.environ, {
    "FRONTEND_DOMAIN": "localhost",
    "FRONTEND_PORT": "19006",
    "CONFIRMATION_EMAIL_SERVER_TYPE": "SendGrid",
    "SENDGRID_API_KEY": MOCK_SENDGRID_API_KEY,
    "SENDER_EMAIL": MOCK_SENDER_EMAIL
})
def test_signup_sendgrid(mocker: MockerFixture):
    client = TestClient(app)

    mock_sg = mocker.MagicMock()
    mock_sg.send = mocker.MagicMock()
    mock_sg_client_class = mocker.patch("app.utils.mailer.sendgrid.sendgrid.SendGridAPIClient")
    mock_sg_client_class.return_value = mock_sg

    USER_EMAIL = "test@example.com"

    response = client.post(
        "/api/auth/signup",
        json={"email": USER_EMAIL, "password": "testPassword"}
    )
    db = SessionLocal()
    db_user = db.query(models.User).filter(models.User.email == USER_EMAIL)
    assert db_user.count() == 1
    assert db_user.first().email == USER_EMAIL
    assert db_user.first().is_activated == False
    db_user.delete()
    db.commit()
    assert response.status_code == 200
    assert response.json() == {"message": "Confirmation email was sent."}

    assert mock_sg_client_class.call_count == 1
    assert mock_sg_client_class.call_args[0][0] == MOCK_SENDGRID_API_KEY
    assert mock_sg.send.call_count == 1
    assert mock_sg.send.call_args[0][0].get()["from"]["email"] == MOCK_SENDER_EMAIL
    assert mock_sg.send.call_args[0][0].personalizations[0].get()["to"][0]["email"] == USER_EMAIL
    content = mock_sg.send.call_args[0][0].get()["content"]
    urls = {}
    for c in content:
        if (c.get("type") == "text/plain"):
            plain_text_body = c.get("value")
            plain_text_urls = url_pattern_in_plain_text.findall(plain_text_body)
            urls.update({"plain_text_url": plain_text_urls[0]})
        elif (c.get("type") == "text/html"):
            html_body = c.get("value")
            html_urls = url_pattern_in_html.findall(html_body)
            urls.update({"html_url": html_urls[0]})
    assert urls.get("plain_text_url") == urls.get("html_url")
