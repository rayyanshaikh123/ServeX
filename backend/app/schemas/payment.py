from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PaymentCreateRequest(BaseModel):
    order_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class WebhookPayload(BaseModel):
    event: str
    payload: dict


class PaymentResponse(BaseModel):
    id: str
    restaurant_id: str
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str]
    status: str
    amount: float
    currency: str
    created_at: datetime
    updated_at: datetime
