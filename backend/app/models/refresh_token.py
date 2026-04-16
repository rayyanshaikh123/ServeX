from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RefreshToken(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    restaurant_id: str
    jti: str
    token_hash: str
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
