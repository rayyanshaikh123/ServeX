from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.user import CurrentUser
from app.services.analytics_service import compute_analytics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def analytics_summary(
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    """Compute live analytics — bypasses Redis cache so data is always fresh."""
    payload = await compute_analytics(current_user.restaurant_id)
    return payload
