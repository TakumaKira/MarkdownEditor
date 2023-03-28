import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.constants import FRONTEND_PROTOCOL, MESSAGE_AUTH_CONFIRMATION_EMAIL_SENT, MESSAGE_AUTH_EMAIL_IS_ALREADY_ACTIVATED
from app.utils.http_exceptions import ApiException
from app.utils.security import generate_signup_token
from app.database import crud
from app.database.base import get_db
from app.utils.mailer import MAILER
from app.utils.mailer.message import get_signup_confirmation_message
from app.database.exceptions import ActivatedUserExists

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

API_PATH_SIGNUP = "/signup"

FRONTEND_PATH_CONFIRM_SIGNUP_EMAIL = "/confirm-signup-email"

class SignupPayload(BaseModel):
    email: str
    password: str


@router.post(API_PATH_SIGNUP)
async def auth_create_user(payload: SignupPayload, db: Session = Depends(get_db)):
    try:
        crud.create_user(db, user=payload)
    except ActivatedUserExists:
        raise ApiException(status_code=409, message=MESSAGE_AUTH_EMAIL_IS_ALREADY_ACTIVATED)
    except Exception as e:
        print(e)
        raise ApiException(status_code=500, message="Something went wrong.")

    signup_token = generate_signup_token(payload.email)
    message = get_signup_confirmation_message(
        frontendProtocol=FRONTEND_PROTOCOL,
        frontendDomain=os.environ.get("FRONTEND_DOMAIN"),
        frontendPort=os.environ.get("FRONTEND_PORT"),
        path=FRONTEND_PATH_CONFIRM_SIGNUP_EMAIL,
        token=signup_token
    )
    mailer = MAILER()
    mailer.send(
        to=payload.email,
        subject=message["subject"],
        html=message["html"],
        text=message["text"]
    )
    return {"message": MESSAGE_AUTH_CONFIRMATION_EMAIL_SENT}
