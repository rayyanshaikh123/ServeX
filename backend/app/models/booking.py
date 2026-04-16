from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Booking(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    table_id: str
    guest_name: str
    party_size: int
    start_time: datetime
    end_time: datetime
    status: str = "reserved"
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
