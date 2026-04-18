from typing import List
from fastapi import APIRouter, HTTPException, status
from app.db.mongo import get_menu_collection
from app.schemas.menu import MenuResponse, MenuListResponse

router = APIRouter(prefix="/api/menu", tags=["menu"])

def _menu_response(doc: dict) -> MenuResponse:
    return MenuResponse(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        name=doc["name"],
        price=doc["price"],
        isVeg=doc["isVeg"],
        category=doc.get("category", "Uncategorized"),
        description=doc.get("description"),
        image_url=doc.get("image_url"),
        spiceLevel=doc["spiceLevel"],
        tags=doc.get("tags", []),
        stock=doc.get("stock", 0),
        low_stock_threshold=doc.get("low_stock_threshold", 0),
        time_to_cook=doc.get("time_to_cook", 0),
        embedding_status=doc.get("embedding_status"),
        embedding_updated_at=doc.get("embedding_updated_at"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )

@router.get("/{restaurant_id}", response_model=MenuListResponse)
async def get_restaurant_menu(restaurant_id: str):
    menu = get_menu_collection()
    # Deduplicate by name at the DB level – keeps the first inserted doc per name
    pipeline = [
        {"$match": {"restaurant_id": restaurant_id}},
        {"$sort": {"created_at": 1}},
        {"$group": {"_id": "$name", "doc": {"$first": "$$ROOT"}}},
        {"$replaceRoot": {"newRoot": "$doc"}},
        {"$sort": {"created_at": 1}},
    ]
    items = await menu.aggregate(pipeline).to_list(length=1000)
    return MenuListResponse(
        items=[_menu_response(doc) for doc in items],
        total=len(items)
    )
