from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import get_current_user, hash_password
from app.db.mongo import get_users_collection
from app.schemas.user import CurrentUser, UserCreateRequest, UserResponse
from app.services.auth_service import create_user, get_user_by_email

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser = Depends(get_current_user)) -> UserResponse:
    return current_user


@router.get("", response_model=List[UserResponse])
async def list_users(
    current_user: CurrentUser = Depends(require_roles(Role.owner)),
) -> List[UserResponse]:
    """List all users (admins) for the owner's restaurant."""
    collection = get_users_collection()
    cursor = collection.find({"restaurant_id": current_user.restaurant_id})
    users = await cursor.to_list(length=200)
    return [
        UserResponse(
            id=str(u["_id"]),
            restaurant_id=u["restaurant_id"],
            email=u["email"],
            role=u.get("role", "admin"),
            is_active=u.get("is_active", True),
            created_at=u.get("created_at"),
        )
        for u in users
    ]


@router.post("", response_model=UserResponse)
async def create_user_endpoint(
    payload: UserCreateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner)),
) -> UserResponse:
    if payload.role == Role.owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Owner role is reserved"
        )

    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email in use")

    hashed = hash_password(payload.password)
    user_id = await create_user(
        payload.email,
        hashed,
        payload.role,
        current_user.restaurant_id,
    )

    return UserResponse(
        id=user_id,
        restaurant_id=current_user.restaurant_id,
        email=payload.email,
        role=payload.role,
        is_active=True,
        created_at=datetime.utcnow(),
    )
