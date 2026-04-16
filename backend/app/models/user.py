from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.core.roles import Role


class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    email: EmailStr
    hashed_password: str
    role: Role
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
