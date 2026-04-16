from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.roles import Role


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: Role


class UserResponse(BaseModel):
    id: str
    restaurant_id: str
    email: EmailStr
    role: Role
    is_active: bool
    created_at: datetime


class CurrentUser(UserResponse):
    pass
