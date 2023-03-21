import os

FRONTEND_PROTOCOL="https" if os.environ.get("USE_SECURE_PROTOCOL") == "true" else "http"

ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_ENCODE_ALGORITHM = "HS256"
