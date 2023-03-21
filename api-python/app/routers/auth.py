import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.constants import FRONTEND_PROTOCOL
from app.utils.security import generate_signup_token
from app.database import crud
from app.database.base import get_db
from app.utils.mailer import MAILER
from app.utils.mailer.message import get_signup_confirmation_message


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)


class SignupPayload(BaseModel):
    email: str
    password: str


@router.post("/signup")
async def auth_create_user(payload: SignupPayload, db: Session = Depends(get_db)):
    crud.create_user(db, user=payload)
    signup_token = generate_signup_token(payload.email)
    message = get_signup_confirmation_message(
        frontendProtocol=FRONTEND_PROTOCOL,
        frontendDomain=os.environ.get("FRONTEND_DOMAIN"),
        frontendPort=os.environ.get("FRONTEND_PORT"),
        path="/confirm-signup-email",
        token=signup_token
    )
    mailer = MAILER()
    mailer.send(
        to=payload.email,
        subject=message["subject"],
        html=message["html"],
        text=message["text"]
    )
    return {"message": "Confirmation email was sent."}
