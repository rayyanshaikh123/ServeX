from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Restaurant(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    timezone: str = "UTC"
    status: str = "active"
    owner_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
