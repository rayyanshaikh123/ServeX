from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class InvoiceResponse(BaseModel):
    id: str
    restaurant_id: str
    order_id: str
    invoice_number: str
    subtotal: float
    tax: float
    total: float
    currency: str
    storage_backend: str
    file_path: Optional[str]
    file_url: Optional[str]
    created_at: datetime
