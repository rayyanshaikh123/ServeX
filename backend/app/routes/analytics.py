from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_limiter import FastAPILimiter

from app.core.security import get_current_user
from app.schemas.user import CurrentUser
from app.services.analytics_cache import get_cached_analytics, set_cached_analytics
from app.services.analytics_service import compute_analytics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def analytics_summary(
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    redis = FastAPILimiter.redis
    if redis is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis not available",
        )

    cached = await get_cached_analytics(redis, current_user.restaurant_id)
    if cached:
        return cached

    payload = await compute_analytics(current_user.restaurant_id)
    await set_cached_analytics(redis, current_user.restaurant_id, payload)
    return payload
