import re
from typing import Dict, List, Optional

from app.core.config import get_settings
from app.db.mongo import get_menu_collection
from app.services.embedding import get_embedding_service

_NON_VEG_KEYWORDS = [
    "non-veg",
    "nonveg",
    "chicken",
    "mutton",
    "fish",
    "prawn",
    "shrimp",
    "beef",
    "pork",
]
_VEG_KEYWORDS = ["veg", "vegetarian", "vegan"]


def _extract_price(query: str) -> Optional[int]:
    patterns = [
        r"(?:under|below|less than|upto|up to|<=)\s*(\d+)",
        r"(?:budget|max|maximum)\s*(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, query)
        if match:
            return int(match.group(1))

    match = re.search(r"(\d+)\s*(?:rs|inr|rupees)", query)
    if match:
        return int(match.group(1))

    return None


def _extract_veg_preference(query: str) -> Optional[bool]:
    if any(word in query for word in _NON_VEG_KEYWORDS):
        return False
    if any(word in query for word in _VEG_KEYWORDS):
        return True
    return None


def _extract_spice_level(query: str) -> Optional[str]:
    if "mild" in query or "low spice" in query or "less spicy" in query:
        return "low"
    if "medium" in query:
        return "medium"
    if "spicy" in query or "hot" in query or "extra spicy" in query:
        return "high"
    return None


def _build_filter(query: str, restaurant_id: str) -> Optional[Dict]:
    q = query.lower()
    filter_doc: Dict = {"restaurant_id": restaurant_id}

    price = _extract_price(q)
    if price is not None:
        filter_doc["price"] = {"$lte": price}

    is_veg = _extract_veg_preference(q)
    if is_veg is not None:
        filter_doc["isVeg"] = is_veg

    spice = _extract_spice_level(q)
    if spice is not None:
        filter_doc["spiceLevel"] = spice

    return filter_doc or None


async def retrieve_menu_items(
    query: str, restaurant_id: str, top_k: Optional[int] = None
) -> List[Dict]:
    settings = get_settings()
    embedder = get_embedding_service()
    query_vector = embedder.embed_query(query)
    limit = top_k or settings.top_k

    vector_stage = {
        "$vectorSearch": {
            "index": settings.mongodb_vector_index,
            "path": "embedding",
            "queryVector": query_vector,
            "numCandidates": settings.vector_candidates,
            "limit": limit,
        }
    }

    filter_doc = _build_filter(query, restaurant_id)
    if filter_doc:
        vector_stage["$vectorSearch"]["filter"] = filter_doc

    pipeline = [
        vector_stage,
        {
            "$project": {
                "name": 1,
                "price": 1,
                "isVeg": 1,
                "spiceLevel": 1,
                "tags": 1,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    collection = get_menu_collection()
    cursor = collection.aggregate(pipeline)
    return await cursor.to_list(length=limit)
