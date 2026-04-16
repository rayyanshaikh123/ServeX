from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RestaurantResponse(BaseModel):
    id: str
    name: str
    timezone: str
    status: str
    owner_id: Optional[str] = None
    created_at: datetime


class RestaurantListResponse(BaseModel):
    items: list[RestaurantResponse]
    total: int


class RestaurantSwitchRequest(BaseModel):
    restaurant_id: str = Field(..., min_length=8)
