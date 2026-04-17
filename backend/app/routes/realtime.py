import logging
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status

from app.core.security import decode_token
from app.services.auth_service import get_user_by_id
from app.services.realtime import get_realtime_manager

router = APIRouter(prefix="/ws", tags=["realtime"])


@router.websocket("/restaurant/{restaurant_id}")
async def restaurant_ws(websocket: WebSocket, restaurant_id: str, token: str | None = None):
    await websocket.accept()
    if not token:
        logging.info(f"WS Connection rejected for {restaurant_id}: Missing token")
        await websocket.close(code=1008)
        return

    try:
        payload = decode_token(token)
    except HTTPException:
        logging.info(f"WS Connection rejected for {restaurant_id}: Invalid token")
        await websocket.close(code=1008)
        return

    if payload.get("type") != "access":
        logging.info(f"WS Connection rejected for {restaurant_id}: Token type mismatch")
        await websocket.close(code=1008)
        return

    if payload.get("restaurant_id") != restaurant_id:
        logging.info(f"WS Connection rejected for {restaurant_id}: Restaurant ID mismatch")
        await websocket.close(code=1008)
        return

    user = await get_user_by_id(payload.get("sub"))
    if not user or not user.get("is_active", True):
        logging.info(f"WS Connection rejected for {restaurant_id}: User inactive or not found")
        await websocket.close(code=1008)
        return

    manager = get_realtime_manager()
    await manager.connect(restaurant_id, websocket)
    logging.info(f"WS Connected successfully: {restaurant_id} (user: {payload.get('sub')})")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(restaurant_id, websocket)
