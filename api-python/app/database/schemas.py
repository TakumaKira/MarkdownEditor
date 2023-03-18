from typing import Union
from datetime import datetime

from pydantic import BaseModel


class DocumentBase(BaseModel):
    id: str
    user_id: int
    name: Union[str, None] = None
    content: Union[str, None] = None
    created_at: datetime
    updated_at: datetime
    saved_on_db_at: datetime
    is_deleted: bool


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    pass

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: str
    password: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    is_activated: bool
    documents: list[Document] = []

    class Config:
        orm_mode = True
