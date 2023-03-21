import os
from typing import Union
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.constants import JWT_ENCODE_ALGORITHM
from app.database import crud
from app.database.base import get_db
from app.database.models import User


class TokenData(BaseModel):
    email: Union[str, None] = None


async def get_x_auth_token_header(x_auth_token: str = Header("x-auth-token")):
    if x_auth_token == None:
        raise HTTPException(status_code=400, detail="x-auth-token header invalid")
    return x_auth_token


async def get_current_user(token: str = Depends(get_x_auth_token_header), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.environ.get("API_JWT_SECRET_KEY"), algorithms=[JWT_ENCODE_ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = crud.get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.is_activated == False:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
