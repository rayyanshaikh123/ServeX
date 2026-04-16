from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Table(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    name: str
    capacity: int
    status: str = "free"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
