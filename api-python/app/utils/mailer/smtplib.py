import os
import smtplib

from email.message import EmailMessage
from email.utils import make_msgid


def send_email_smtp(to: str, subject: str, html: str, text: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = os.environ.get("SENDER_EMAIL")
    msg["To"] = to
    msg["Message-ID"] = make_msgid()

    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    with smtplib.SMTP_SSL(os.environ.get("STANDARD_MAIL_SERVER_HOST"), os.environ.get("STANDARD_MAIL_SERVER_PORT"), timeout=5) as server:
        try:
            server.login(os.environ.get("STANDARD_MAIL_SERVER_USER"), os.environ.get("STANDARD_MAIL_SERVER_PASS"))
            server.send_message(msg)
        except Exception as e:
            print(e)
