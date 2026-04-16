from datetime import datetime
from typing import Dict, List, Optional, Tuple

from bson import ObjectId

from app.core.tenancy import scope_by_restaurant
from app.db.mongo import get_tables_collection


def _to_object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except Exception:
        return None


async def list_tables(restaurant_id: str, limit: int, skip: int) -> Tuple[List[Dict], int]:
    collection = get_tables_collection()
    query = scope_by_restaurant({}, restaurant_id)
    total = await collection.count_documents(query)
    items = (
        await collection.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return items, total


async def get_table(restaurant_id: str, table_id: str) -> Optional[Dict]:
    collection = get_tables_collection()
    obj_id = _to_object_id(table_id)
    if obj_id is None:
        return None
    query = scope_by_restaurant({"_id": obj_id}, restaurant_id)
    return await collection.find_one(query)


async def create_table(restaurant_id: str, payload: Dict) -> Dict:
    collection = get_tables_collection()
    now = datetime.utcnow()
    doc = {
        "restaurant_id": restaurant_id,
        "name": payload["name"],
        "capacity": payload["capacity"],
        "status": "free",
        "created_at": now,
        "updated_at": now,
    }
    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def update_table(restaurant_id: str, table_id: str, payload: Dict) -> Optional[Dict]:
    collection = get_tables_collection()
    obj_id = _to_object_id(table_id)
    if obj_id is None:
        return None
    updates = {k: v for k, v in payload.items() if v is not None}
    if not updates:
        return await get_table(restaurant_id, table_id)
    updates["updated_at"] = datetime.utcnow()
    await collection.update_one(
        scope_by_restaurant({"_id": obj_id}, restaurant_id), {"$set": updates}
    )
    return await get_table(restaurant_id, table_id)


async def delete_table(restaurant_id: str, table_id: str) -> bool:
    collection = get_tables_collection()
    obj_id = _to_object_id(table_id)
    if obj_id is None:
        return False
    result = await collection.delete_one(scope_by_restaurant({"_id": obj_id}, restaurant_id))
    return result.deleted_count > 0
