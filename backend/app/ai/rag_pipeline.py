from functools import lru_cache
from typing import Dict, List

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm import get_llm
from app.ai.retriever import retrieve_menu_items
from app.services.session_memory import get_session_memory

_PROMPT = """You are ServeX AI waiter.
Customer asked: {query}

Only use this menu data:
{retrieved_items}

Conversation so far:
{history}

Give a helpful, friendly recommendation.
Keep it short and conversational.
"""


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
        line = f"- {name} | price: {price} | {is_veg} | spice: {spice}"
        if tags:
            line += f" | tags: {tags}"
        lines.append(line)
    return "\n".join(lines)


class RagPipeline:
    def __init__(self) -> None:
        self._prompt = ChatPromptTemplate.from_template(_PROMPT)
        self._llm = get_llm()
        self._chain = self._prompt | self._llm
        self._memory = get_session_memory()

    async def stream_response(self, query: str, session_id: str, restaurant_id: str):
        items = await retrieve_menu_items(query, restaurant_id)
        retrieved_items = _format_items(items)
        history = await self._memory.get_history_text(session_id)

        async for chunk in self._chain.astream(
            {"query": query, "retrieved_items": retrieved_items, "history": history}
        ):
            if chunk.content:
                yield chunk.content


@lru_cache(maxsize=1)
def get_rag_pipeline() -> RagPipeline:
    return RagPipeline()
