import json
import logging
from functools import lru_cache
from typing import AsyncIterator, Dict, List

import ollama

from app.ai.retriever import retrieve_menu_items
from app.core.config import get_settings
from app.services.session_memory import get_session_memory

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are a friendly, polite AI waiter for ServeX. "
    "Your job is to greet the customer warmly, answer their questions, and "
    "ONLY recommend food items that are EXACTLY listed in the provided 'Available Menu Items'. "
    "You must NEVER make up, invent, or guess dishes that are not on the list. "
    "If a requested item is not on the menu, politely apologize and suggest the closest available dish from the menu. "
    "Always write prices with the rupee symbol (₹). "
    "Format the names of recommended dishes in **bold**."
)

_USER_TEMPLATE = """\
Conversation history:
{history}

Available Menu Items:
{retrieved_items}

Customer says: {query}

Instructions for your response:
1. Always include a polite, conversational greeting or response to the customer's text.
2. If you recommend food, you MUST ONLY choose from the 'Available Menu Items' listed above.
3. Do NOT recommend anything else (no sorbet, no pudding, etc. unless it is literally in the list above).
4. Use the exact price and add the ₹ symbol (e.g., ₹240).
5. Wrap dish names in **bold**."""



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


def _items_to_cards(items: List[Dict]) -> List[Dict]:
    """Convert retrieved items into a clean card-friendly format for the frontend."""
    cards = []
    for item in items:
        cards.append({
            "id": str(item.get("_id", "")),
            "name": item.get("name", "Unknown"),
            "price": item.get("price", 0),
            "isVeg": item.get("isVeg", True),
            "spiceLevel": item.get("spiceLevel", "Medium"),
            "tags": item.get("tags") or [],
            "score": round(item.get("score", 0), 3),
        })
    return cards


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

        # Emit menu item cards as a JSON line before the streamed text
        cards = _items_to_cards(items)
        if cards:
            yield f"__MENU_ITEMS__{json.dumps(cards)}__END_MENU_ITEMS__\n"

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
