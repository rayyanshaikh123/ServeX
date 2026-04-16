from datetime import datetime, timedelta
from typing import Dict

from app.core.config import get_settings
from app.db.mongo import get_orders_collection


def _window_start() -> datetime:
    settings = get_settings()
    return datetime.utcnow() - timedelta(days=settings.analytics_window_days)


def _build_revenue_pipeline(restaurant_id: str) -> list:
    start = _window_start()
    return [
        {"$match": {"restaurant_id": restaurant_id, "created_at": {"$gte": start}}},
        {
            "$group": {
                "_id": None,
                "revenue": {"$sum": "$total"},
                "orders": {"$sum": 1},
            }
        },
    ]


def _build_top_items_pipeline(restaurant_id: str) -> list:
    start = _window_start()
    return [
        {"$match": {"restaurant_id": restaurant_id, "created_at": {"$gte": start}}},
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.menu_item_id",
                "name": {"$first": "$items.name"},
                "quantity": {"$sum": "$items.quantity"},
                "revenue": {"$sum": "$items.total"},
            }
        },
        {"$sort": {"revenue": -1}},
        {"$limit": 10},
    ]


def _build_peak_hours_pipeline(restaurant_id: str) -> list:
    start = _window_start()
    return [
        {"$match": {"restaurant_id": restaurant_id, "created_at": {"$gte": start}}},
        {
            "$project": {
                "hour": {"$hour": "$created_at"},
            }
        },
        {"$group": {"_id": "$hour", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]


async def compute_analytics(restaurant_id: str) -> Dict:
    orders = get_orders_collection()

    revenue_cursor = orders.aggregate(_build_revenue_pipeline(restaurant_id))
    revenue = await revenue_cursor.to_list(length=1)
    revenue_doc = revenue[0] if revenue else {"revenue": 0, "orders": 0}

    top_cursor = orders.aggregate(_build_top_items_pipeline(restaurant_id))
    top_items = await top_cursor.to_list(length=10)

    peak_cursor = orders.aggregate(_build_peak_hours_pipeline(restaurant_id))
    peak_hours = await peak_cursor.to_list(length=24)

    return {
        "window_days": get_settings().analytics_window_days,
        "revenue": round(revenue_doc.get("revenue", 0), 2),
        "orders": revenue_doc.get("orders", 0),
        "top_items": top_items,
        "peak_hours": peak_hours,
    }
