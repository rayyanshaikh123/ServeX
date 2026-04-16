from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.limiter import auth_limiter
from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import create_access_token, create_refresh_token
from app.db.mongo import get_restaurants_collection
from app.schemas.auth import TokenResponse
from app.schemas.restaurant import (
    RestaurantListResponse,
    RestaurantResponse,
    RestaurantSwitchRequest,
)
from app.schemas.user import CurrentUser
from app.services.auth_service import store_refresh_token
from app.core.security import hash_token

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


def _restaurant_response(doc: dict) -> RestaurantResponse:
    return RestaurantResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        timezone=doc.get("timezone", "UTC"),
        status=doc.get("status", "active"),
        owner_id=doc.get("owner_id"),
        created_at=doc.get("created_at"),
    )


@router.get("", response_model=RestaurantListResponse)
async def list_restaurants(
    current_user: CurrentUser = Depends(require_roles(Role.owner)),
) -> RestaurantListResponse:
    restaurants = get_restaurants_collection()
    cursor = restaurants.find({"owner_id": current_user.id}).sort("created_at", -1)
    items = await cursor.to_list(length=200)
    if not items:
        try:
            fallback_id = ObjectId(current_user.restaurant_id)
        except Exception:
            fallback_id = None
        if fallback_id is not None:
            fallback = await restaurants.find_one({"_id": fallback_id})
            if fallback:
                items = [fallback]
    return RestaurantListResponse(
        items=[_restaurant_response(doc) for doc in items],
        total=len(items),
    )


@router.post(
    "/switch",
    response_model=TokenResponse,
    dependencies=[Depends(auth_limiter())],
)
async def switch_restaurant(
    payload: RestaurantSwitchRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner)),
) -> TokenResponse:
    restaurants = get_restaurants_collection()
    try:
        restaurant_id = ObjectId(payload.restaurant_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid restaurant id"
        ) from exc

    restaurant = await restaurants.find_one(
        {"_id": restaurant_id, "owner_id": current_user.id}
    )
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    access_token, access_exp = create_access_token(
        current_user.id, current_user.role, payload.restaurant_id
    )
    refresh_token, refresh_jti, refresh_exp = create_refresh_token(
        current_user.id, current_user.role, payload.restaurant_id
    )
    await store_refresh_token(
        current_user.id,
        payload.restaurant_id,
        refresh_jti,
        hash_token(refresh_token),
        refresh_exp,
    )

    expires_in = int((access_exp - datetime.now(timezone.utc)).total_seconds())
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=max(expires_in, 0),
    )
