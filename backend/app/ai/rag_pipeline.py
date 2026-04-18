import logging
from functools import lru_cache
from typing import AsyncIterator, Dict, List

import ollama

from app.ai.retriever import retrieve_menu_items
from app.core.config import get_settings
from app.services.session_memory import get_session_memory

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are ServeX AI waiter. "
    "Be helpful, friendly and concise. "
    "Only recommend items from the provided menu data."
)

_USER_TEMPLATE = """\
Customer asked: {query}

Menu items available:
{retrieved_items}

Conversation so far:
{history}

Give a short, helpful recommendation."""


def _format_items(items: List[Dict]) -> str:
    if not items:
        return "No matching menu items found."
    lines = []
    for item in items:
        name = item.get("name", "Unknown")
        price = item.get("price", "N/A")
        is_veg = "veg" if item.get("isVeg") else "non-veg"
        spice = item.get("spiceLevel", "unknown")
        tags = ", ".join(item.get("tags") or [])
        line = f"- {name} | price: ₹{price} | {is_veg} | spice: {spice}"
        if tags:
            line += f" | tags: {tags}"
        lines.append(line)
    return "\n".join(lines)


class RagPipeline:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = ollama.AsyncClient(host=self._settings.ollama_base_url)
        self._memory = get_session_memory()

    async def stream_response(
        self, query: str, session_id: str, restaurant_id: str
    ) -> AsyncIterator[str]:
        items = await retrieve_menu_items(query, restaurant_id)
        retrieved_items = _format_items(items)
        history = await self._memory.get_history_text(session_id)

        user_content = _USER_TEMPLATE.format(
            query=query,
            retrieved_items=retrieved_items,
            history=history,
        )

        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]

        async for part in await self._client.chat(
            model=self._settings.llm_model,
            messages=messages,
            stream=True,
            think=False,
            options={"temperature": self._settings.llm_temperature, "num_predict": self._settings.llm_num_predict},
        ):
            text = part.message.content
            logger.debug("Ollama chunk: %r", text)
            if text:
                yield text


@lru_cache(maxsize=1)
def get_rag_pipeline() -> RagPipeline:
    return RagPipeline()
