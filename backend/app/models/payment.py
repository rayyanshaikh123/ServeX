from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Payment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    restaurant_id: str
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    status: str = "created"
    amount: float
    currency: str
    idempotency_key: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}
