from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItemCreateRequest(BaseModel):
    menu_item_id: str
    quantity: int = Field(..., ge=1, le=1000)
    instructions: Optional[str] = Field(None, max_length=500)


class OrderCreateRequest(BaseModel):
    table_id: Optional[str] = None
    items: List[OrderItemCreateRequest]
    notes: Optional[str] = Field(None, max_length=500)


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., min_length=2, max_length=20)


class OrderItemResponse(BaseModel):
    menu_item_id: str
    name: str
    quantity: int
    unit_price: float
    total: float
    instructions: Optional[str] = None
    time_to_cook: int


class OrderResponse(BaseModel):
    id: str
    restaurant_id: str
    table_id: Optional[str]
    status: str
    items: List[OrderItemResponse]
    subtotal: float
    tax: float
    total: float
    currency: str
    notes: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
