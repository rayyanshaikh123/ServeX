import json
from functools import lru_cache
from typing import Dict, Set

from fastapi import WebSocket


class RealtimeManager:
    def __init__(self) -> None:
        self._connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, restaurant_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.setdefault(restaurant_id, set()).add(websocket)

    def disconnect(self, restaurant_id: str, websocket: WebSocket) -> None:
        if restaurant_id in self._connections:
            self._connections[restaurant_id].discard(websocket)
            if not self._connections[restaurant_id]:
                del self._connections[restaurant_id]

    async def broadcast(self, restaurant_id: str, event: Dict) -> None:
        if restaurant_id not in self._connections:
            return
        message = json.dumps(event)
        stale = []
        for ws in self._connections[restaurant_id]:
            try:
                await ws.send_text(message)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self.disconnect(restaurant_id, ws)


@lru_cache(maxsize=1)
def get_realtime_manager() -> RealtimeManager:
    return RealtimeManager()
