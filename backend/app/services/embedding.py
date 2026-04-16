from collections import OrderedDict
from functools import lru_cache
from threading import Lock
from typing import List, Optional

from sentence_transformers import SentenceTransformer

from app.core.config import get_settings


class _EmbeddingCache:
    def __init__(self, max_items: int) -> None:
        self._max_items = max_items
        self._data: OrderedDict[str, List[float]] = OrderedDict()
        self._lock = Lock()

    def get(self, key: str) -> Optional[List[float]]:
        with self._lock:
            value = self._data.get(key)
            if value is None:
                return None
            self._data.move_to_end(key)
            return value

    def set(self, key: str, value: List[float]) -> None:
        with self._lock:
            self._data[key] = value
            self._data.move_to_end(key)
            while len(self._data) > self._max_items:
                self._data.popitem(last=False)


class EmbeddingService:
    def __init__(self, model_name: str, cache_max_items: int) -> None:
        self._model = SentenceTransformer(model_name)
        self._cache = _EmbeddingCache(cache_max_items)

    def embed_query(self, text: str) -> List[float]:
        cached = self._cache.get(text)
        if cached is not None:
            return cached
        vector = self._model.encode([text], normalize_embeddings=True)[0].tolist()
        self._cache.set(text, vector)
        return vector

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        vectors = self._model.encode(texts, normalize_embeddings=True, batch_size=32)
        return [vector.tolist() for vector in vectors]


@lru_cache(maxsize=1)
def get_embedding_service() -> EmbeddingService:
    settings = get_settings()
    return EmbeddingService(settings.embedding_model, settings.cache_max_items)
