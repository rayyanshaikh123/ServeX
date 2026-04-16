from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.limiter import auth_limiter
from app.core.roles import Role
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.mongo import get_restaurants_collection
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.services.auth_service import (
    create_user,
    get_refresh_token,
    get_user_by_email,
    revoke_refresh_token,
    store_refresh_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    dependencies=[Depends(auth_limiter())],
)
async def register(payload: RegisterRequest) -> TokenResponse:
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email in use")

    restaurants = get_restaurants_collection()
    restaurant_doc = {
        "name": payload.restaurant_name,
        "timezone": "UTC",
        "status": "active",
        "created_at": datetime.utcnow(),
    }
    restaurant_result = await restaurants.insert_one(restaurant_doc)
    restaurant_id = str(restaurant_result.inserted_id)

    hashed = hash_password(payload.password)
    user_id = await create_user(payload.email, hashed, Role.owner, restaurant_id)
    await restaurants.update_one(
        {"_id": restaurant_result.inserted_id},
        {"$set": {"owner_id": user_id}},
    )

    access_token, access_exp = create_access_token(user_id, Role.owner.value, restaurant_id)
    refresh_token, refresh_jti, refresh_exp = create_refresh_token(
        user_id, Role.owner.value, restaurant_id
    )
    await store_refresh_token(
        user_id,
        restaurant_id,
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


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(auth_limiter())],
)
async def login(payload: LoginRequest) -> TokenResponse:
    user = await get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad login")
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive"
        )

    user_id = str(user["_id"])
    role = user["role"]
    restaurant_id = user["restaurant_id"]

    access_token, access_exp = create_access_token(user_id, role, restaurant_id)
    refresh_token, refresh_jti, refresh_exp = create_refresh_token(
        user_id, role, restaurant_id
    )
    await store_refresh_token(
        user_id,
        restaurant_id,
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


@router.post(
    "/refresh",
    response_model=TokenResponse,
    dependencies=[Depends(auth_limiter())],
)
async def refresh(payload: RefreshRequest) -> TokenResponse:
    token_payload = decode_token(payload.refresh_token)
    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    jti = token_payload.get("jti")
    user_id = token_payload.get("sub")
    restaurant_id = token_payload.get("restaurant_id")
    role = token_payload.get("role")
    if not jti or not user_id or not restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    record = await get_refresh_token(jti)
    if not record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    if record.get("revoked_at") is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    if record.get("token_hash") != hash_token(payload.refresh_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    if record.get("user_id") != user_id or record.get("restaurant_id") != restaurant_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    now = datetime.now(timezone.utc)
    if record.get("expires_at") and record["expires_at"].replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    await revoke_refresh_token(jti)

    access_token, access_exp = create_access_token(user_id, role, restaurant_id)
    refresh_token, refresh_jti, refresh_exp = create_refresh_token(
        user_id, role, restaurant_id
    )
    await store_refresh_token(
        user_id,
        restaurant_id,
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


@router.post("/logout", dependencies=[Depends(auth_limiter())])
async def logout(payload: RefreshRequest) -> dict:
    token_payload = decode_token(payload.refresh_token)
    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    await revoke_refresh_token(token_payload.get("jti"))
    return {"status": "ok"}
