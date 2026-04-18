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
        {"$match": {"restaurant_id": restaurant_id, "status": {"$in": ["paid", "closed"]}, "created_at": {"$gte": start}}},
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


def _build_hourly_revenue_pipeline(restaurant_id: str) -> list:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return [
        {"$match": {"restaurant_id": restaurant_id, "created_at": {"$gte": today_start}}},
        {
            "$group": {
                "_id": {"$hour": "$created_at"},
                "revenue": {"$sum": "$total"},
            }
        },
        {"$sort": {"_id": 1}},
    ]


async def compute_analytics(restaurant_id: str) -> Dict:
    orders = get_orders_collection()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Total revenue from paid/closed orders
    revenue_cursor = orders.aggregate(_build_revenue_pipeline(restaurant_id))
    revenue = await revenue_cursor.to_list(length=1)
    revenue_doc = revenue[0] if revenue else {"revenue": 0, "orders": 0}

    # Active orders (pending/confirmed/preparing/ready)
    active_statuses = ["pending", "confirmed", "preparing", "ready", "served"]
    active_count = await orders.count_documents(
        {"restaurant_id": restaurant_id, "status": {"$in": active_statuses}}
    )

    # Orders placed today
    daily_count = await orders.count_documents(
        {"restaurant_id": restaurant_id, "created_at": {"$gte": today_start}}
    )

    # Top items
    top_cursor = orders.aggregate(_build_top_items_pipeline(restaurant_id))
    top_items = await top_cursor.to_list(length=10)

    # Peak hours
    peak_cursor = orders.aggregate(_build_peak_hours_pipeline(restaurant_id))
    peak_hours = await peak_cursor.to_list(length=24)

    # Hourly revenue today (for chart)
    hourly_cursor = orders.aggregate(_build_hourly_revenue_pipeline(restaurant_id))
    hourly_raw = await hourly_cursor.to_list(length=24)
    hourly_revenue = {str(h["_id"]): round(h["revenue"], 2) for h in hourly_raw}

    # Performance score: % of orders with no delay (simple heuristic 0-1)
    total_today = daily_count if daily_count > 0 else 1
    performance_score = round(min(1.0, active_count / total_today), 2) if daily_count else 0.8

    return {
        "window_days": get_settings().analytics_window_days,
        "total_revenue": round(revenue_doc.get("revenue", 0), 2),
        "revenue": round(revenue_doc.get("revenue", 0), 2),
        "orders": revenue_doc.get("orders", 0),
        "active_orders": active_count,
        "daily_orders": daily_count,
        "performance_score": performance_score,
        "hourly_revenue": hourly_revenue,
        "top_items": top_items,
        "peak_hours": peak_hours,
    }
