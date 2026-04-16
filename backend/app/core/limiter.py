import logging
from typing import Tuple

from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from redis.asyncio import Redis

from app.core.config import get_settings


def _parse_rate_limit(value: str) -> Tuple[int, int]:
    raw = (value or "").strip().lower()
    if not raw:
        return 60, 60

    parts = raw.split("/")
    if len(parts) != 2:
        return 60, 60

    try:
        times = int(parts[0])
    except ValueError:
        return 60, 60

    unit = parts[1].strip()
    seconds = 60
    if unit in {"s", "sec", "second", "seconds"}:
        seconds = 1
    elif unit in {"m", "min", "minute", "minutes"}:
        seconds = 60
    elif unit in {"h", "hr", "hour", "hours"}:
        seconds = 3600
    elif unit in {"d", "day", "days"}:
        seconds = 86400

    return max(times, 1), max(seconds, 1)


async def init_rate_limiter() -> None:
    settings = get_settings()
    try:
        redis = Redis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )
        await FastAPILimiter.init(redis, prefix=settings.redis_prefix)
    except Exception as exc:
        logging.getLogger(__name__).exception("Rate limiter init failed")
        raise RuntimeError("Rate limiter init failed") from exc


def limiter_for(value: str) -> RateLimiter:
    times, seconds = _parse_rate_limit(value)
    return RateLimiter(times=times, seconds=seconds)


def default_limiter() -> RateLimiter:
    settings = get_settings()
    return limiter_for(settings.rate_limit_default)


def auth_limiter() -> RateLimiter:
    settings = get_settings()
    return limiter_for(settings.rate_limit_auth)


def ai_limiter() -> RateLimiter:
    settings = get_settings()
    return limiter_for(settings.rate_limit_ai)
