
def get_signup_confirmation_message(frontendProtocol: str, frontendDomain: str, frontendPort: str, path: str, token: str):
    text = """\
Please access to {frontendProtocol}://{frontendDomain}{frontendPort}{path}?token={token} to confirm your email."""
    html = """\
<div style="height: 100%; width: 100%; background-color: #2B2D31;">
  <div style="padding: 100px 0; text-align: center;">
    <p style="font-family: sans-serif; font-weight: 500; font-size: 28px; color: #7C8187; letter-spacing: 3px;">Welcome to</p>
    <p style="font-family: sans-serif; font-weight: 700; font-size: 36px; color: #ffffff; letter-spacing: 12px;">MARKDOWN</p>
    <a href="{frontendProtocol}://{frontendDomain}{frontendPort}{path}?token={token}" style="text-decoration: none; color: #ffffff;">
      <div style="margin: auto; width: 202px; padding: 10px 0; background-color: #E46643; border-radius: 4px;">
        <span style="font-family: sans-serif; font-size: 15px;">
          Confirm Email
        </span>
      </div>
    </a>
  </div>
</div>"""
    return {
        "subject": "Welcome to Markdown Editor!",
        "text": text.format(frontendProtocol=frontendProtocol, frontendDomain=frontendDomain, frontendPort=frontendPort, path=path, token=token),
        "html": html.format(frontendProtocol=frontendProtocol, frontendDomain=frontendDomain, frontendPort=frontendPort, path=path, token=token),
    }
