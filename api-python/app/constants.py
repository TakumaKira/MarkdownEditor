import os

FRONTEND_PROTOCOL = "https" if os.environ.get("USE_SECURE_PROTOCOL") == "true" else "http"

MESSAGE_MAIN = "MarkdownEditor API is working."
MESSAGE_AUTH_CONFIRMATION_EMAIL_SENT = "Confirmation email was sent."
MESSAGE_AUTH_EMAIL_IS_ALREADY_ACTIVATED = "Email is already registered and activated."

ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_ENCODE_ALGORITHM = "HS256"
