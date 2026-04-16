from typing import Iterable

from fastapi import Depends, HTTPException, status

from app.core.roles import Role
from app.core.security import get_current_user
from app.schemas.user import CurrentUser


def require_roles(*roles: Role):
    allowed = {role.value if isinstance(role, Role) else str(role) for role in roles}

    async def checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return checker


def ensure_same_restaurant(resource_restaurant_id: str, user: CurrentUser) -> None:
    if resource_restaurant_id != user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-restaurant access denied",
        )


def ensure_resource_access(resource: dict, user: CurrentUser) -> None:
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    ensure_same_restaurant(resource.get("restaurant_id"), user)
