from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Invoice(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    order_id: str
    invoice_number: str
    subtotal: float
    tax: float
    total: float
    currency: str = "INR"
    storage_backend: str = "local"
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
