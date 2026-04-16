from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BookingCreateRequest(BaseModel):
    table_id: str
    guest_name: str = Field(..., min_length=2, max_length=200)
    party_size: int = Field(..., ge=1, le=1000)
    start_time: datetime
    duration_minutes: Optional[int] = Field(None, ge=15, le=720)
    notes: Optional[str] = Field(None, max_length=500)


class BookingResponse(BaseModel):
    id: str
    restaurant_id: str
    table_id: str
    guest_name: str
    party_size: int
    start_time: datetime
    end_time: datetime
    status: str
    notes: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class BookingListResponse(BaseModel):
    items: list[BookingResponse]
    total: int
