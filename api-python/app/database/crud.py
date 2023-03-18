from sqlalchemy.orm import Session

from . import models, schemas
from app.utils.security import get_password_hash


def get_documents(db: Session, user_id: int):
    return db.query(models.Document).filter(models.Document.user_id == user_id).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password=get_password_hash(user.password)
    db_user = models.User(email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()


def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
