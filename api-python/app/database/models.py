from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_activated = Column(Boolean, default=False)

    documents = relationship("Document", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True, nullable=True)
    content = Column(String, index=True, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    saved_on_db_at = Column(DateTime)
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="documents")
