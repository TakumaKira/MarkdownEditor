import os
from .smtplib import send_email_smtp
from .sendgrid import send_email_sendgrid


send_email = None


class MAILER:
  send = None

  def __init__(self):
    if os.environ.get('CONFIRMATION_EMAIL_SERVER_TYPE') == 'StarndardMailServer':
      self.send = send_email_smtp
    elif os.environ.get('CONFIRMATION_EMAIL_SERVER_TYPE') == 'SendGrid':
      self.send = send_email_sendgrid
