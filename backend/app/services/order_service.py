from datetime import datetime
from typing import Dict, List, Optional, Tuple

from bson import ObjectId

from app.core.config import get_settings
from app.core.tenancy import scope_by_restaurant
from app.db.mongo import get_menu_collection, get_orders_collection

_ALLOWED_TRANSITIONS = {
    "pending": {"confirmed"},
    "confirmed": {"preparing"},
    "preparing": {"ready"},
    "ready": {"served"},
    "served": {"paid"},
    "paid": {"closed"},
    "closed": set(),
}


def _to_object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except Exception:
        return None


def _normalize_items(
    requested: List[Dict],
    menu_items: List[Dict],
) -> Tuple[List[Dict], float]:
    lookup = {str(item["_id"]): item for item in menu_items}
    normalized: List[Dict] = []
    subtotal = 0.0
    for item in requested:
        menu_id = item["menu_item_id"]
        if menu_id not in lookup:
            raise ValueError("Menu item not found")
        menu_doc = lookup[menu_id]
        quantity = item["quantity"]
        unit_price = float(menu_doc["price"])
        line_total = unit_price * quantity
        subtotal += line_total
        normalized.append(
            {
                "menu_item_id": menu_id,
                "name": menu_doc["name"],
                "quantity": quantity,
                "unit_price": unit_price,
                "total": line_total,
                "instructions": item.get("instructions"),
                "time_to_cook": menu_doc.get("time_to_cook", 0),
            }
        )
    return normalized, subtotal


async def list_orders(
    restaurant_id: str,
    status: Optional[str],
    limit: int,
    skip: int,
) -> Tuple[List[Dict], int]:
    collection = get_orders_collection()
    query = scope_by_restaurant({}, restaurant_id)
    if status:
        query["status"] = status
    total = await collection.count_documents(query)
    items = (
        await collection.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return items, total


async def get_order(restaurant_id: str, order_id: str) -> Optional[Dict]:
    collection = get_orders_collection()
    obj_id = _to_object_id(order_id)
    if obj_id is None:
        return None
    query = scope_by_restaurant({"_id": obj_id}, restaurant_id)
    return await collection.find_one(query)


async def create_order(restaurant_id: str, payload: Dict, created_by: Optional[str]) -> Dict:
    settings = get_settings()
    orders = get_orders_collection()
    menu = get_menu_collection()

    menu_ids = []
    for item in payload["items"]:
        obj_id = _to_object_id(item["menu_item_id"])
        if obj_id is None:
            raise ValueError("Invalid menu item id")
        menu_ids.append(obj_id)

    unique_ids = list({value for value in menu_ids})
    menu_docs = await menu.find(
        scope_by_restaurant({"_id": {"$in": unique_ids}}, restaurant_id)
    ).to_list(length=len(unique_ids))

    if len(menu_docs) != len(unique_ids):
        raise ValueError("Menu item not found")

    normalized_items, subtotal = _normalize_items(payload["items"], menu_docs)
    tax = round(subtotal * settings.tax_rate, 2)
    total = round(subtotal + tax, 2)
    now = datetime.utcnow()

    doc = {
        "restaurant_id": restaurant_id,
        "table_id": payload.get("table_id"),
        "status": "pending",
        "items": normalized_items,
        "subtotal": round(subtotal, 2),
        "tax": tax,
        "total": total,
        "currency": settings.currency,
        "notes": payload.get("notes"),
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
    }

    result = await orders.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def update_order_status(
    restaurant_id: str,
    order_id: str,
    new_status: str,
) -> Optional[Dict]:
    orders = get_orders_collection()
    doc = await get_order(restaurant_id, order_id)
    if not doc:
        return None

    current_status = doc.get("status", "pending")
    if new_status == current_status:
        return doc

    allowed = _ALLOWED_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise ValueError("Invalid status transition")

    now = datetime.utcnow()
    await orders.update_one(
        {"_id": doc["_id"]},
        {"$set": {"status": new_status, "updated_at": now}},
    )
    return await get_order(restaurant_id, order_id)
