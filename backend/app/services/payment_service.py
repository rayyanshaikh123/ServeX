import hmac
import json
import secrets
from datetime import datetime
from hashlib import sha256
from typing import Optional

import razorpay

from app.core.config import get_settings
from app.core.tenancy import scope_by_restaurant
from app.db.mongo import get_orders_collection, get_payments_collection
from app.services.order_service import get_order, update_order_status


def _client() -> razorpay.Client:
    settings = get_settings()
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def _verify_webhook_signature(body: bytes, signature: str) -> bool:
    settings = get_settings()
    digest = hmac.new(
        settings.razorpay_webhook_secret.encode("utf-8"), body, sha256
    ).hexdigest()
    return hmac.compare_digest(digest, signature)


def _idempotency_key() -> str:
    return secrets.token_hex(16)


async def create_payment_order(restaurant_id: str, order_id: str) -> dict:
    orders = get_orders_collection()
    order = await get_order(restaurant_id, order_id)
    if not order:
        raise ValueError("Order not found")

    if order.get("status") not in {"pending", "confirmed", "served"}:
        raise ValueError("Order is not payable")

    settings = get_settings()
    amount_paise = int(order["total"] * 100)
    payload = {
        "amount": amount_paise,
        "currency": order.get("currency", settings.currency),
        "receipt": f"order_{order_id}",
        "payment_capture": 1,
    }

    client = _client()
    rp_order = client.order.create(payload)

    payments = get_payments_collection()
    now = datetime.utcnow()
    doc = {
        "restaurant_id": restaurant_id,
        "order_id": order_id,
        "razorpay_order_id": rp_order["id"],
        "status": "created",
        "amount": order["total"],
        "currency": order.get("currency", settings.currency),
        "idempotency_key": _idempotency_key(),
        "created_at": now,
        "updated_at": now,
    }
    await payments.insert_one(doc)
    return {
        "razorpay_order_id": rp_order["id"],
        "amount": order["total"],
        "currency": order.get("currency", settings.currency),
    }


async def verify_payment(restaurant_id: str, payload: dict) -> dict:
    payments = get_payments_collection()
    rp_order_id = payload["razorpay_order_id"]
    rp_payment_id = payload["razorpay_payment_id"]
    signature = payload["razorpay_signature"]

    record = await payments.find_one(
        scope_by_restaurant({"razorpay_order_id": rp_order_id}, restaurant_id)
    )
    if not record:
        raise ValueError("Payment record not found")

    if record.get("razorpay_payment_id"):
        return record

    client = _client()
    client.utility.verify_payment_signature(
        {
            "razorpay_order_id": rp_order_id,
            "razorpay_payment_id": rp_payment_id,
            "razorpay_signature": signature,
        }
    )

    now = datetime.utcnow()
    await payments.update_one(
        {"_id": record["_id"]},
        {
            "$set": {
                "razorpay_payment_id": rp_payment_id,
                "razorpay_signature": signature,
                "status": "paid",
                "updated_at": now,
            }
        },
    )

    await update_order_status(restaurant_id, record["order_id"], "paid")
    return await payments.find_one({"_id": record["_id"]})


async def handle_webhook(headers: dict, body: bytes) -> Optional[dict]:
    signature = headers.get("x-razorpay-signature") or headers.get(
        "X-Razorpay-Signature"
    )
    if not signature:
        raise ValueError("Missing signature")

    if not _verify_webhook_signature(body, signature):
        raise ValueError("Invalid signature")

    payload = json.loads(body.decode("utf-8"))
    event = payload.get("event")
    if event not in {"payment.captured", "payment.failed"}:
        return {"status": "ignored"}

    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    rp_payment_id = entity.get("id")
    rp_order_id = entity.get("order_id")
    status = entity.get("status")

    if not rp_order_id:
        raise ValueError("Missing order id")

    payments = get_payments_collection()
    record = await payments.find_one({"razorpay_order_id": rp_order_id})
    if not record:
        raise ValueError("Payment record not found")

    now = datetime.utcnow()
    update_fields = {
        "razorpay_payment_id": rp_payment_id,
        "status": "paid" if status == "captured" else "failed",
        "updated_at": now,
    }

    await payments.update_one({"_id": record["_id"]}, {"$set": update_fields})

    if status == "captured":
        await update_order_status(record["restaurant_id"], record["order_id"], "paid")

    return {"status": "ok"}
