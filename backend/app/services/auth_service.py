from datetime import datetime
from typing import Optional

from bson import ObjectId

from app.core.roles import Role
from app.db.mongo import get_refresh_tokens_collection, get_users_collection


def _to_object_id(value: Optional[str]) -> Optional[ObjectId]:
    if not value:
        return None
    try:
        return ObjectId(value)
    except Exception:
        return None


def _normalize_user(user: Optional[dict]) -> Optional[dict]:
    if not user:
        return None
    user["id"] = str(user["_id"])
    return user


async def get_user_by_email(email: str) -> Optional[dict]:
    collection = get_users_collection()
    return await collection.find_one({"email": email.lower()})


async def get_user_by_id(user_id: str) -> Optional[dict]:
    collection = get_users_collection()
    obj_id = _to_object_id(user_id)
    if obj_id is None:
        return None
    user = await collection.find_one({"_id": obj_id})
    return _normalize_user(user)


async def create_user(
    email: str,
    hashed_password: str,
    role: Role,
    restaurant_id: str,
    user_id: Optional[str] = None,
) -> str:
    collection = get_users_collection()
    doc = {
        "restaurant_id": restaurant_id,
        "email": email.lower(),
        "hashed_password": hashed_password,
        "role": role.value if isinstance(role, Role) else str(role),
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    if user_id:
        doc["_id"] = ObjectId(user_id)
    result = await collection.insert_one(doc)
    return str(result.inserted_id)


async def store_refresh_token(
    user_id: str,
    restaurant_id: str,
    jti: str,
    token_hash: str,
    expires_at: datetime,
) -> None:
    collection = get_refresh_tokens_collection()
    await collection.insert_one(
        {
            "user_id": user_id,
            "restaurant_id": restaurant_id,
            "jti": jti,
            "token_hash": token_hash,
            "expires_at": expires_at,
            "revoked_at": None,
            "created_at": datetime.utcnow(),
        }
    )


async def get_refresh_token(jti: str) -> Optional[dict]:
    collection = get_refresh_tokens_collection()
    return await collection.find_one({"jti": jti})


async def revoke_refresh_token(jti: str) -> None:
    collection = get_refresh_tokens_collection()
    await collection.update_one({"jti": jti}, {"$set": {"revoked_at": datetime.utcnow()}})
