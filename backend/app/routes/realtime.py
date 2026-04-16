from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status

from app.core.security import decode_token
from app.services.auth_service import get_user_by_id
from app.services.realtime import get_realtime_manager

router = APIRouter(prefix="/ws", tags=["realtime"])


@router.websocket("/restaurant/{restaurant_id}")
async def restaurant_ws(websocket: WebSocket, restaurant_id: str, token: str | None = None):
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = decode_token(token)
    except HTTPException:
        await websocket.close(code=1008)
        return

    if payload.get("type") != "access":
        await websocket.close(code=1008)
        return

    if payload.get("restaurant_id") != restaurant_id:
        await websocket.close(code=1008)
        return

    user = await get_user_by_id(payload.get("sub"))
    if not user or not user.get("is_active", True):
        await websocket.close(code=1008)
        return

    manager = get_realtime_manager()
    await manager.connect(restaurant_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(restaurant_id, websocket)
