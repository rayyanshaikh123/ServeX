from datetime import datetime
from typing import Any, Dict, Optional

from app.db.mongo import get_audit_logs_collection


async def write_audit_log(
    restaurant_id: str,
    actor_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    collection = get_audit_logs_collection()
    await collection.insert_one(
        {
            "restaurant_id": restaurant_id,
            "actor_id": actor_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
        }
    )
