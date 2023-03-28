from sqlalchemy.orm import Session

from . import models, schemas, exceptions
from app.utils.security import get_password_hash


def get_documents(db: Session, user_id: int):
    return db.query(models.Document).filter(models.Document.user_id == user_id).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password=get_password_hash(user.password)
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user == None:
        new_user = models.User(email=user.email, hashed_password=hashed_password)
        db.add(new_user)
    else:
        if existing_user.is_activated == False:
            existing_user.hashed_password = hashed_password
        else:
            raise exceptions.ActivatedUserExists()
    db.commit()


def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
