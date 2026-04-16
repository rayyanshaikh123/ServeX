import asyncio
from collections import OrderedDict, deque
from functools import lru_cache
from typing import Deque, Tuple

from app.core.config import get_settings


class SessionMemory:
    def __init__(self, max_sessions: int, max_turns: int) -> None:
        self._max_sessions = max_sessions
        self._max_turns = max_turns
        self._sessions: "OrderedDict[str, Deque[Tuple[str, str]]]" = OrderedDict()
        self._lock = asyncio.Lock()

    async def get_history_text(self, session_id: str) -> str:
        async with self._lock:
            turns = self._sessions.get(session_id)
            if not turns:
                return "None"
            lines = []
            for user, assistant in turns:
                lines.append(f"User: {user}")
                lines.append(f"Assistant: {assistant}")
            return "\n".join(lines)

    async def add_turn(self, session_id: str, user: str, assistant: str) -> None:
        async with self._lock:
            if session_id in self._sessions:
                turns = self._sessions.pop(session_id)
            else:
                turns = deque(maxlen=self._max_turns)
            turns.append((user, assistant))
            self._sessions[session_id] = turns
            while len(self._sessions) > self._max_sessions:
                self._sessions.popitem(last=False)


@lru_cache(maxsize=1)
def get_session_memory() -> SessionMemory:
    settings = get_settings()
    return SessionMemory(settings.session_max_sessions, settings.session_max_turns)
