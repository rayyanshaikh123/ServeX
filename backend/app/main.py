import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.limiter import init_rate_limiter
from app.db.indexes import ensure_indexes
from app.db.mongo import close_mongo, connect_to_mongo
from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router
from app.routes.inventory import router as inventory_router
from app.routes.bookings import router as bookings_router
from app.routes.analytics import router as analytics_router
from app.routes.realtime import router as realtime_router
from app.routes.tables import router as tables_router
from app.routes.menu import router as menu_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.restaurants import router as restaurants_router
from app.routes.users import router as users_router


def create_app() -> FastAPI:
    settings = get_settings()
    logging.basicConfig(level=logging.INFO)

    app = FastAPI(title=settings.app_name, version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth_router)
    app.include_router(analytics_router)
    app.include_router(chat_router)
    app.include_router(bookings_router)
    app.include_router(inventory_router)
    app.include_router(menu_router)
    app.include_router(orders_router)
    app.include_router(payments_router)
    app.include_router(restaurants_router)
    app.include_router(realtime_router)
    app.include_router(tables_router)
    app.include_router(users_router)

    @app.on_event("startup")
    async def startup() -> None:
        await connect_to_mongo()
        await ensure_indexes()
        await init_rate_limiter()
        logging.getLogger(__name__).info("MongoDB connected: %s", settings.mongodb_db)

    @app.on_event("shutdown")
    async def shutdown() -> None:
        await close_mongo()

    return app


app = create_app()
