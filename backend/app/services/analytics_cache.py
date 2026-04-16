import json
from typing import Dict

from redis.asyncio import Redis

from app.core.config import get_settings


def _cache_key(restaurant_id: str) -> str:
    settings = get_settings()
    return f"{settings.redis_prefix}:analytics:{restaurant_id}"


async def get_cached_analytics(redis: Redis, restaurant_id: str) -> Dict | None:
    key = _cache_key(restaurant_id)
    raw = await redis.get(key)
    if not raw:
        return None
    return json.loads(raw)


async def set_cached_analytics(redis: Redis, restaurant_id: str, payload: Dict) -> None:
    settings = get_settings()
    key = _cache_key(restaurant_id)
    await redis.set(key, json.dumps(payload), ex=settings.analytics_cache_ttl_s)
