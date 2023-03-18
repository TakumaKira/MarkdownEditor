import os
import sendgrid
from sendgrid.helpers.mail import Mail


def send_email_sendgrid(to: str, subject: str, html: str, text: str):
    message = Mail(
        from_email=os.environ.get('SENDER_EMAIL'),
        to_emails=to,
        subject=subject,
        html_content=html,
        plain_text_content=text
    )
    try:
        sg = sendgrid.SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        # print(response.status_code)
        # print(response.body)
        # print(response.headers)
    except Exception as e:
        print(e.message)
