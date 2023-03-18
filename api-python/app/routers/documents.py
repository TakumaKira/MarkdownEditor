from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import schemas, crud
from app.database.base import get_db
from .dependencies import get_current_active_user
from ..utils.websocket import manager

router = APIRouter(
    prefix="/api/documents",
    tags=["documents"],
    dependencies=[Depends(get_current_active_user)]
)


@router.get("/", response_model=list[schemas.Document])
async def documents_test_route(user_id: int, db: Session = Depends(get_db)):
    items = crud.get_documents(db, user_id)
    # TODO: Send actual response.
    await manager.send_message("Documents sent.", user_id)
    return items
