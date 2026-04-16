import argparse
import asyncio
import os
import sys
from datetime import datetime
from typing import Dict, List

from pymongo import UpdateOne

SCRIPT_DIR = os.path.dirname(__file__)
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIR, "..")))

from app.core.config import get_settings
from app.db.mongo import close_mongo, connect_to_mongo, get_menu_collection
from app.services.embedding import get_embedding_service

SAMPLE_MENU: List[Dict] = [
    {
        "name": "Paneer Kolhapuri",
        "price": 250,
        "isVeg": True,
        "spiceLevel": "high",
        "tags": ["spicy", "north indian"],
    },
    {
        "name": "Butter Chicken",
        "price": 320,
        "isVeg": False,
        "spiceLevel": "medium",
        "tags": ["creamy", "north indian"],
    },
    {
        "name": "Veg Hakka Noodles",
        "price": 180,
        "isVeg": True,
        "spiceLevel": "medium",
        "tags": ["indo chinese", "noodles"],
    },
    {
        "name": "Masala Dosa",
        "price": 150,
        "isVeg": True,
        "spiceLevel": "low",
        "tags": ["south indian", "crispy"],
    },
    {
        "name": "Mutton Rogan Josh",
        "price": 420,
        "isVeg": False,
        "spiceLevel": "high",
        "tags": ["kashmiri", "rich"],
    },
    {
        "name": "Chicken Biryani",
        "price": 300,
        "isVeg": False,
        "spiceLevel": "high",
        "tags": ["rice", "spicy"],
    },
]


def _menu_to_text(item: Dict) -> str:
    tags = ", ".join(item.get("tags") or [])
    return (
        f"{item.get('name', '')}. Price {item.get('price', '')}. "
        f"Veg {item.get('isVeg', '')}. Spice {item.get('spiceLevel', '')}. "
        f"Tags {tags}."
    )


async def _seed_if_empty(restaurant_id: str) -> None:
    collection = get_menu_collection()
    count = await collection.count_documents({"restaurant_id": restaurant_id})
    if count == 0:
        items = []
        for item in SAMPLE_MENU:
            payload = dict(item)
            payload["restaurant_id"] = restaurant_id
            items.append(payload)
        await collection.insert_many(items)


async def _generate_embeddings(rebuild: bool, restaurant_id: str) -> int:
    collection = get_menu_collection()
    query = {"restaurant_id": restaurant_id}
    if not rebuild:
        query["embedding"] = {"$exists": False}
    items = await collection.find(query).to_list(length=None)

    if not items:
        return 0

    embedder = get_embedding_service()
    texts = [_menu_to_text(item) for item in items]
    vectors = embedder.embed_texts(texts)

    ops = []
    for item, vector in zip(items, vectors):
        ops.append(
            UpdateOne(
                {"_id": item["_id"]},
                {
                    "$set": {
                        "embedding": vector,
                        "embedding_status": "ready",
                        "embedding_error": None,
                        "embedding_updated_at": datetime.utcnow(),
                    }
                },
            )
        )

    if ops:
        result = await collection.bulk_write(ops)
        return result.modified_count

    return 0


async def main() -> None:
    parser = argparse.ArgumentParser(description="Generate menu embeddings")
    parser.add_argument("--seed", action="store_true", help="Seed sample menu items")
    parser.add_argument(
        "--rebuild", action="store_true", help="Regenerate embeddings for all items"
    )
    parser.add_argument(
        "--restaurant-id",
        default=None,
        help="Restaurant ID scope for seeding and embeddings",
    )
    args = parser.parse_args()
    settings = get_settings()
    restaurant_id = args.restaurant_id or settings.seed_restaurant_id

    await connect_to_mongo()
    try:
        if args.seed:
            await _seed_if_empty(restaurant_id)
        updated = await _generate_embeddings(args.rebuild, restaurant_id)
        print(f"Embeddings updated: {updated}")
    finally:
        await close_mongo()


if __name__ == "__main__":
    asyncio.run(main())
