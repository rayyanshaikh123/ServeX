from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field("ServeX", alias="APP_NAME")
    env: str = Field("dev", alias="ENV")

    mongodb_uri: str = Field(..., alias="MONGODB_URI")
    mongodb_db: str = Field("servex", alias="MONGODB_DB")
    mongodb_menu_collection: str = Field("menu", alias="MONGODB_MENU_COLLECTION")
    mongodb_vector_index: str = Field("menu_vector_index", alias="MONGODB_VECTOR_INDEX")
    mongodb_restaurants_collection: str = Field(
        "restaurants", alias="MONGODB_RESTAURANTS_COLLECTION"
    )
    mongodb_users_collection: str = Field("users", alias="MONGODB_USERS_COLLECTION")
    mongodb_tables_collection: str = Field("tables", alias="MONGODB_TABLES_COLLECTION")
    mongodb_bookings_collection: str = Field(
        "bookings", alias="MONGODB_BOOKINGS_COLLECTION"
    )
    mongodb_orders_collection: str = Field("orders", alias="MONGODB_ORDERS_COLLECTION")
    mongodb_payments_collection: str = Field(
        "payments", alias="MONGODB_PAYMENTS_COLLECTION"
    )
    mongodb_invoices_collection: str = Field(
        "invoices", alias="MONGODB_INVOICES_COLLECTION"
    )
    mongodb_audit_logs_collection: str = Field(
        "audit_logs", alias="MONGODB_AUDIT_LOGS_COLLECTION"
    )
    mongodb_refresh_tokens_collection: str = Field(
        "refresh_tokens", alias="MONGODB_REFRESH_TOKENS_COLLECTION"
    )

    embedding_model: str = Field(
        "sentence-transformers/all-MiniLM-L6-v2", alias="EMBEDDING_MODEL"
    )
    embedding_dim: int = Field(384, alias="EMBEDDING_DIM")
    top_k: int = Field(4, alias="TOP_K")
    vector_candidates: int = Field(50, alias="VECTOR_CANDIDATES")

    ollama_base_url: str = Field("http://localhost:11434", alias="OLLAMA_BASE_URL")
    llm_model: str = Field("llama3", alias="LLM_MODEL")
    llm_temperature: float = Field(0.4, alias="LLM_TEMPERATURE")
    llm_num_predict: int = Field(256, alias="LLM_NUM_PREDICT")
    llm_timeout_s: int = Field(60, alias="LLM_TIMEOUT_S")

    seed_restaurant_id: str = Field("servex-demo", alias="SEED_RESTAURANT_ID")
    seed_admin_email: str = Field("admin@servex.com", alias="SEED_ADMIN_EMAIL")
    seed_admin_password: str = Field("Admin@12345", alias="SEED_ADMIN_PASSWORD")
    seed_admin_restaurant_name: str = Field("ServeX HQ", alias="SEED_ADMIN_RESTAURANT_NAME")

    jwt_secret: str = Field("change-me", alias="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    jwt_access_ttl_minutes: int = Field(30, alias="JWT_ACCESS_TTL_MINUTES")
    jwt_refresh_ttl_minutes: int = Field(43200, alias="JWT_REFRESH_TTL_MINUTES")
    jwt_issuer: str = Field("servex", alias="JWT_ISSUER")
    jwt_audience: str = Field("servex-users", alias="JWT_AUDIENCE")

    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")
    redis_prefix: str = Field("servex", alias="REDIS_PREFIX")
    rate_limit_default: str = Field("120/minute", alias="RATE_LIMIT_DEFAULT")
    rate_limit_auth: str = Field("10/minute", alias="RATE_LIMIT_AUTH")
    rate_limit_ai: str = Field("20/minute", alias="RATE_LIMIT_AI")

    razorpay_key_id: str = Field("", alias="RAZORPAY_KEY_ID")
    razorpay_key_secret: str = Field("", alias="RAZORPAY_KEY_SECRET")
    razorpay_webhook_secret: str = Field("", alias="RAZORPAY_WEBHOOK_SECRET")

    invoice_storage_backend: str = Field("local", alias="INVOICE_STORAGE_BACKEND")
    invoice_local_dir: str = Field("./storage/invoices", alias="INVOICE_LOCAL_DIR")
    s3_bucket: str = Field("", alias="S3_BUCKET")
    s3_region: str = Field("", alias="S3_REGION")
    s3_access_key: str = Field("", alias="S3_ACCESS_KEY")
    s3_secret_key: str = Field("", alias="S3_SECRET_KEY")
    s3_endpoint_url: str = Field("", alias="S3_ENDPOINT_URL")

    ws_allowed_origins: str = Field("*", alias="WS_ALLOWED_ORIGINS")

    cache_max_items: int = Field(1024, alias="CACHE_MAX_ITEMS")
    session_max_turns: int = Field(6, alias="SESSION_MAX_TURNS")
    session_max_sessions: int = Field(500, alias="SESSION_MAX_SESSIONS")
    default_low_stock_threshold: int = Field(5, alias="DEFAULT_LOW_STOCK_THRESHOLD")
    booking_slot_minutes: int = Field(60, alias="BOOKING_SLOT_MINUTES")
    booking_buffer_minutes: int = Field(15, alias="BOOKING_BUFFER_MINUTES")
    tax_rate: float = Field(0.05, alias="TAX_RATE")
    currency: str = Field("INR", alias="CURRENCY")
    analytics_window_days: int = Field(30, alias="ANALYTICS_WINDOW_DAYS")
    analytics_cache_ttl_s: int = Field(900, alias="ANALYTICS_CACHE_TTL_S")

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        populate_by_name=True,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
