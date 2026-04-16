from datetime import datetime
from typing import Dict

from app.core.config import get_settings
from app.db.mongo import get_orders_collection


def _rollup_collection_name() -> str:
    return "analytics_daily"


def _day_key(value: datetime) -> str:
    return value.strftime("%Y-%m-%d")


async def rollup_daily(restaurant_id: str) -> Dict:
    orders = get_orders_collection()
    start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    end = start.replace(hour=23, minute=59, second=59, microsecond=999999)

    match = {
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": start, "$lte": end},
    }

    pipeline = [
        {"$match": match},
        {
            "$group": {
                "_id": None,
                "revenue": {"$sum": "$total"},
                "orders": {"$sum": 1},
            }
        },
    ]

    cursor = orders.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    doc = result[0] if result else {"revenue": 0, "orders": 0}

    collection = orders.database[_rollup_collection_name()]
    await collection.update_one(
        {"restaurant_id": restaurant_id, "day": _day_key(start)},
        {
            "$set": {
                "restaurant_id": restaurant_id,
                "day": _day_key(start),
                "revenue": doc.get("revenue", 0),
                "orders": doc.get("orders", 0),
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    return {"status": "ok"}
