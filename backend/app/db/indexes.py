import logging

from app.db.mongo import (
    get_bookings_collection,
    get_invoices_collection,
    get_menu_collection,
    get_orders_collection,
    get_payments_collection,
    get_restaurants_collection,
    get_refresh_tokens_collection,
    get_tables_collection,
    get_users_collection,
)


async def ensure_indexes() -> None:
    logger = logging.getLogger(__name__)

    users = get_users_collection()
    await users.create_index("email", unique=True)
    await users.create_index("restaurant_id")

    restaurants = get_restaurants_collection()
    await restaurants.create_index("owner_id")

    menu = get_menu_collection()
    await menu.create_index("restaurant_id")

    tables = get_tables_collection()
    await tables.create_index("restaurant_id")

    bookings = get_bookings_collection()
    await bookings.create_index([("table_id", 1), ("start_time", 1), ("end_time", 1)])
    await bookings.create_index([("restaurant_id", 1), ("start_time", 1)])

    orders = get_orders_collection()
    await orders.create_index([("restaurant_id", 1), ("created_at", -1)])

    invoices = get_invoices_collection()
    await invoices.create_index([("restaurant_id", 1), ("created_at", -1)])
    await invoices.create_index("order_id", unique=True)

    payments = get_payments_collection()
    await payments.create_index([("restaurant_id", 1), ("created_at", -1)])
    await payments.create_index("razorpay_order_id", unique=True)

    refresh_tokens = get_refresh_tokens_collection()
    await refresh_tokens.create_index("jti", unique=True)
    await refresh_tokens.create_index("user_id")
    await refresh_tokens.create_index("expires_at", expireAfterSeconds=0)

    logger.info("MongoDB indexes ensured")
