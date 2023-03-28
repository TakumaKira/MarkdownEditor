from string import Template
from pathlib import Path

def get_signup_confirmation_message(frontendProtocol: str, frontendDomain: str, frontendPort: str, path: str, token: str):
  html_template = Template(Path("./app/utils/mailer/email_templates/signup_confirmation.html").read_text())
  text_template = Template(Path("./app/utils/mailer/email_templates/signup_confirmation.txt").read_text())
  url = f"{frontendProtocol}://{frontendDomain}{path}?token={token}" if frontendPort == None else f"{frontendProtocol}://{frontendDomain}:{frontendPort}{path}?token={token}"
  html = html_template.substitute(url=url)
  text = text_template.substitute(url=url)
  return {
    "subject": "Welcome to Markdown Editor!",
    "text": text,
    "html": html,
  }
