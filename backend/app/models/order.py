from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    menu_item_id: str
    name: str
    quantity: int
    unit_price: float
    total: float
    instructions: Optional[str] = None
    time_to_cook: int = 0


class Order(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    table_id: Optional[str] = None
    status: str = "pending"
    items: List[OrderItem]
    subtotal: float
    tax: float
    total: float
    currency: str = "INR"
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
