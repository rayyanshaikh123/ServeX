from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TableCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    capacity: int = Field(..., ge=1, le=1000)


class TableUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity: Optional[int] = Field(None, ge=1, le=1000)
    status: Optional[str] = Field(None, min_length=2, max_length=20)


class TableResponse(BaseModel):
    id: str
    restaurant_id: str
    name: str
    capacity: int
    status: str
    created_at: datetime
    updated_at: datetime


class TableListResponse(BaseModel):
    items: list[TableResponse]
    total: int
