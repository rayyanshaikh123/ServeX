from typing import Dict


def scope_by_restaurant(filter_doc: Dict, restaurant_id: str) -> Dict:
    scoped = dict(filter_doc or {})
    scoped["restaurant_id"] = restaurant_id
    return scoped
