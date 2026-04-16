from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase

from app.core.config import get_settings

_client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo() -> None:
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncIOMotorClient(settings.mongodb_uri)


async def close_mongo() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("MongoDB client is not initialized")
    settings = get_settings()
    return _client[settings.mongodb_db]


def get_menu_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_menu_collection]


def get_collection(name: str) -> AsyncIOMotorCollection:
    return get_db()[name]


def get_restaurants_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_restaurants_collection]


def get_users_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_users_collection]


def get_tables_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_tables_collection]


def get_bookings_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_bookings_collection]


def get_orders_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_orders_collection]


def get_payments_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_payments_collection]


def get_invoices_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_invoices_collection]


def get_audit_logs_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_audit_logs_collection]


def get_refresh_tokens_collection() -> AsyncIOMotorCollection:
    settings = get_settings()
    return get_db()[settings.mongodb_refresh_tokens_collection]
