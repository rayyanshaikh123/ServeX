from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from bson import ObjectId

from app.core.config import get_settings
from app.core.tenancy import scope_by_restaurant
from app.db.mongo import get_bookings_collection, get_tables_collection


def _to_object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except Exception:
        return None


def _ensure_datetime(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=None)


async def list_bookings(
    restaurant_id: str,
    start: Optional[datetime],
    end: Optional[datetime],
    limit: int,
    skip: int,
) -> Tuple[List[Dict], int]:
    collection = get_bookings_collection()
    query = scope_by_restaurant({}, restaurant_id)
    if start and end:
        query["start_time"] = {"$gte": start}
        query["end_time"] = {"$lte": end}
    total = await collection.count_documents(query)
    items = (
        await collection.find(query)
        .sort("start_time", 1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return items, total


async def _has_conflict(
    restaurant_id: str,
    table_id: ObjectId,
    new_start: datetime,
    new_end: datetime,
    buffer_minutes: int,
) -> bool:
    collection = get_bookings_collection()
    buffer_delta = timedelta(minutes=buffer_minutes)
    buffered_start = new_start - buffer_delta
    buffered_end = new_end + buffer_delta
    query = scope_by_restaurant(
        {
            "table_id": str(table_id),
            "status": {"$in": ["reserved", "confirmed"]},
            "start_time": {"$lt": buffered_end},
            "end_time": {"$gt": buffered_start},
        },
        restaurant_id,
    )
    existing = await collection.find_one(query)
    return existing is not None


async def create_booking(
    restaurant_id: str,
    payload: Dict,
    created_by: Optional[str],
) -> Dict:
    settings = get_settings()
    tables = get_tables_collection()
    bookings = get_bookings_collection()

    table_id = _to_object_id(payload["table_id"])
    if table_id is None:
        raise ValueError("Invalid table id")

    table_doc = await tables.find_one(
        scope_by_restaurant({"_id": table_id}, restaurant_id)
    )
    if not table_doc:
        raise ValueError("Table not found")

    start_time = _ensure_datetime(payload["start_time"])
    duration = payload.get("duration_minutes") or settings.booking_slot_minutes
    end_time = start_time + timedelta(minutes=duration)

    conflict = await _has_conflict(
        restaurant_id, table_id, start_time, end_time, settings.booking_buffer_minutes
    )
    if conflict:
        raise ValueError("Booking conflict")

    now = datetime.utcnow()
    doc = {
        "restaurant_id": restaurant_id,
        "table_id": str(table_id),
        "guest_name": payload["guest_name"],
        "party_size": payload["party_size"],
        "start_time": start_time,
        "end_time": end_time,
        "status": "reserved",
        "notes": payload.get("notes"),
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
    }
    result = await bookings.insert_one(doc)
    doc["_id"] = result.inserted_id

    await tables.update_one(
        {"_id": table_id}, {"$set": {"status": "reserved", "updated_at": now}}
    )

    return doc


async def cancel_booking(restaurant_id: str, booking_id: str) -> Optional[Dict]:
    bookings = get_bookings_collection()
    tables = get_tables_collection()

    obj_id = _to_object_id(booking_id)
    if obj_id is None:
        return None

    booking = await bookings.find_one(scope_by_restaurant({"_id": obj_id}, restaurant_id))
    if not booking:
        return None

    now = datetime.utcnow()
    await bookings.update_one(
        {"_id": obj_id},
        {"$set": {"status": "cancelled", "updated_at": now}},
    )

    table_id = _to_object_id(booking.get("table_id"))
    if table_id is not None:
        await tables.update_one(
            {"_id": table_id}, {"$set": {"status": "free", "updated_at": now}}
        )

    booking["status"] = "cancelled"
    booking["updated_at"] = now
    return booking
