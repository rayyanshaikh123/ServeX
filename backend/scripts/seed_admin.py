import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from app.core.config import get_settings
from app.core.roles import Role
from app.core.security import hash_password
from app.db.indexes import ensure_indexes
from app.db.mongo import (
    close_mongo,
    connect_to_mongo,
    get_restaurants_collection,
    get_users_collection,
)


async def seed_admin() -> None:
    settings = get_settings()
    await connect_to_mongo()
    await ensure_indexes()

    users = get_users_collection()
    restaurants = get_restaurants_collection()

    existing_users = await users.count_documents({})
    if existing_users > 0:
        print("Users already exist. Skipping admin seed.")
        await close_mongo()
        return

    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@servex.com")
    admin_password = os.getenv("SEED_ADMIN_PASSWORD", "Admin@12345")
    restaurant_name = os.getenv("SEED_ADMIN_RESTAURANT_NAME", "ServeX HQ")

    if "SEED_ADMIN_EMAIL" not in os.environ:
        print("Warning: SEED_ADMIN_EMAIL not set. Using default admin@servex.com")
    if "SEED_ADMIN_PASSWORD" not in os.environ:
        print("Warning: SEED_ADMIN_PASSWORD not set. Using default password")

    restaurant_doc = {
        "name": restaurant_name,
        "timezone": "UTC",
        "status": "active",
        "created_at": datetime.now(timezone.utc),
    }
    restaurant_result = await restaurants.insert_one(restaurant_doc)
    restaurant_id = str(restaurant_result.inserted_id)

    hashed = hash_password(admin_password)
    user_doc = {
        "restaurant_id": restaurant_id,
        "email": admin_email.lower(),
        "hashed_password": hashed,
        "role": Role.admin.value,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }
    await users.insert_one(user_doc)

    print("Seeded admin user:")
    print(f"  email: {admin_email}")
    print(f"  restaurant: {restaurant_name}")

    await close_mongo()


if __name__ == "__main__":
    asyncio.run(seed_admin())
