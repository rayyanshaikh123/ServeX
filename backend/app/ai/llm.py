from functools import lru_cache

from langchain_community.chat_models import ChatOllama

from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_llm() -> ChatOllama:
    settings = get_settings()
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.llm_model,
        temperature=settings.llm_temperature,
        num_predict=settings.llm_num_predict,
        timeout=settings.llm_timeout_s,
    )
