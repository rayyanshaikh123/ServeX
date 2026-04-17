from datetime import datetime
from typing import Dict, List, Optional, Tuple

from anyio import to_thread
from bson import ObjectId

from app.core.config import get_settings
from app.core.tenancy import scope_by_restaurant
from app.db.mongo import get_menu_collection
from app.services.embedding import get_embedding_service


def _to_object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except Exception:
        return None


def _menu_to_text(item: Dict) -> str:
    tags = ", ".join(item.get("tags") or [])
    return (
        f"{item.get('name', '')}. Price {item.get('price', '')}. "
        f"Veg {item.get('isVeg', '')}. Spice {item.get('spiceLevel', '')}. "
        f"Tags {tags}. Time to cook {item.get('time_to_cook', 0)} mins."
    )


async def _compute_embedding(text: str) -> List[float]:
    embedder = get_embedding_service()
    vectors = await to_thread.run_sync(lambda: embedder.embed_texts([text]))
    return vectors[0]


async def _sync_embedding(menu_id: ObjectId, doc: Dict) -> None:
    collection = get_menu_collection()
    try:
        vector = await _compute_embedding(_menu_to_text(doc))
        await collection.update_one(
            {"_id": menu_id},
            {
                "$set": {
                    "embedding": vector,
                    "embedding_status": "ready",
                    "embedding_error": None,
                    "embedding_updated_at": datetime.utcnow(),
                }
            },
        )
    except Exception as exc:
        await collection.update_one(
            {"_id": menu_id},
            {
                "$set": {
                    "embedding_status": "failed",
                    "embedding_error": str(exc),
                    "embedding_updated_at": datetime.utcnow(),
                }
            },
        )


async def list_menu_items(
    restaurant_id: str,
    low_stock_only: bool,
    limit: int,
    skip: int,
) -> Tuple[List[Dict], int]:
    collection = get_menu_collection()
    query = scope_by_restaurant({}, restaurant_id)
    if low_stock_only:
        query["$expr"] = {"$lte": ["$stock", "$low_stock_threshold"]}

    total = await collection.count_documents(query)
    items = (
        await collection.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return items, total


async def get_menu_item(restaurant_id: str, item_id: str) -> Optional[Dict]:
    collection = get_menu_collection()
    obj_id = _to_object_id(item_id)
    if obj_id is None:
        return None
    query = scope_by_restaurant({"_id": obj_id}, restaurant_id)
    return await collection.find_one(query)


async def create_menu_item(restaurant_id: str, payload: Dict, item_id: Optional[str] = None) -> Dict:
    settings = get_settings()
    collection = get_menu_collection()
    now = datetime.utcnow()
    low_threshold = payload.get("low_stock_threshold")
    if low_threshold is None:
        low_threshold = settings.default_low_stock_threshold

    doc = {
        "restaurant_id": restaurant_id,
        "name": payload["name"],
        "price": payload["price"],
        "isVeg": payload["isVeg"],
        "spiceLevel": payload["spiceLevel"],
        "tags": payload.get("tags") or [],
        "stock": payload.get("stock", 0),
        "low_stock_threshold": low_threshold,
        "time_to_cook": payload.get("time_to_cook", 0),
        "embedding_status": "pending",
        "embedding_error": None,
        "embedding_updated_at": None,
        "created_at": now,
        "updated_at": now,
    }
    if item_id:
        doc["_id"] = ObjectId(item_id)
    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    await _sync_embedding(result.inserted_id, doc)
    return doc


async def update_menu_item(restaurant_id: str, item_id: str, payload: Dict) -> Optional[Dict]:
    collection = get_menu_collection()
    obj_id = _to_object_id(item_id)
    if obj_id is None:
        return None

    updates = {k: v for k, v in payload.items() if v is not None}
    if not updates:
        return await get_menu_item(restaurant_id, item_id)

    updates["updated_at"] = datetime.utcnow()
    await collection.update_one(
        scope_by_restaurant({"_id": obj_id}, restaurant_id), {"$set": updates}
    )

    doc = await get_menu_item(restaurant_id, item_id)
    if not doc:
        return None

    if any(key in updates for key in ("name", "price", "isVeg", "spiceLevel", "tags")):
        await _sync_embedding(obj_id, doc)

    return await get_menu_item(restaurant_id, item_id)


async def delete_menu_item(restaurant_id: str, item_id: str) -> bool:
    collection = get_menu_collection()
    obj_id = _to_object_id(item_id)
    if obj_id is None:
        return False
    result = await collection.delete_one(scope_by_restaurant({"_id": obj_id}, restaurant_id))
    return result.deleted_count > 0
