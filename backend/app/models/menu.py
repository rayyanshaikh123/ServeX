from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MenuItem(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    isVeg: bool
    spiceLevel: str
    tags: List[str]
    stock: int = 0
    low_stock_threshold: int = 5
    embedding_status: Optional[str] = None
    embedding_error: Optional[str] = None
    embedding_updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    time_to_cook: int = 0
    score: Optional[float] = None

    model_config = {"populate_by_name": True}
