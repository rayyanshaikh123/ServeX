import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Tuple

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.schemas.user import CurrentUser
from app.services.auth_service import get_user_by_id

_password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return _password_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _password_context.verify(password, hashed)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _build_claims(
    subject: str,
    role: str,
    restaurant_id: str,
    token_type: str,
    ttl_minutes: int,
) -> Tuple[Dict[str, Any], datetime]:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=ttl_minutes)
    jti = secrets.token_hex(16)
    payload = {
        "sub": subject,
        "role": role,
        "restaurant_id": restaurant_id,
        "type": token_type,
        "jti": jti,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return payload, expires_at


def create_access_token(user_id: str, role: str, restaurant_id: str) -> Tuple[str, datetime]:
    settings = get_settings()
    payload, expires_at = _build_claims(
        user_id, role, restaurant_id, "access", settings.jwt_access_ttl_minutes
    )
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, expires_at


def create_refresh_token(
    user_id: str, role: str, restaurant_id: str
) -> Tuple[str, str, datetime]:
    settings = get_settings()
    payload, expires_at = _build_claims(
        user_id, role, restaurant_id, "refresh", settings.jwt_refresh_ttl_minutes
    )
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, payload["jti"], expires_at


def decode_token(token: str) -> Dict[str, Any]:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> CurrentUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing credentials",
        )
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    user = await get_user_by_id(payload.get("sub"))
    if not user or not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )
    if user.get("restaurant_id") != payload.get("restaurant_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Restaurant mismatch",
        )
    return CurrentUser(
        id=str(user["_id"]),
        restaurant_id=user["restaurant_id"],
        email=user["email"],
        role=user["role"],
        is_active=user.get("is_active", True),
        created_at=user.get("created_at"),
    )
async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> CurrentUser | None:
    if credentials is None or not credentials.credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
    except Exception:
        return None

    if payload.get("type") != "access":
        return None

    user = await get_user_by_id(payload.get("sub"))
    if not user or not user.get("is_active", True):
        return None
    if user.get("restaurant_id") != payload.get("restaurant_id"):
        return None

    return CurrentUser(
        id=str(user["_id"]),
        restaurant_id=user["restaurant_id"],
        email=user["email"],
        role=user["role"],
        is_active=user.get("is_active", True),
        created_at=user.get("created_at"),
    )
