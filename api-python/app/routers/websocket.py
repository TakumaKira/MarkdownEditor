from fastapi import APIRouter, Depends, WebSocket
from .dependencies import get_current_active_user
from ..utils.websocket import manager


router = APIRouter(
    prefix="/ws",
    tags=["websocket"],
)


@router.websocket("")
async def websocket_endpoint(websocket: WebSocket, current_user=Depends(get_current_active_user)):
    await manager.connect(websocket, current_user.id)
