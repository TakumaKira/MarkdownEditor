import os
from passlib.context import CryptContext
from jose import jwt
from app.constants import JWT_ENCODE_ALGORITHM


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def generate_signup_token(email: str):
    data = { "sub": "email:{email}".format(email=email), "is": "SignupToken" }
    encoded_jwt = jwt.encode(data, os.environ.get("API_JWT_SECRET_KEY"), algorithm=JWT_ENCODE_ALGORITHM)
    return encoded_jwt
