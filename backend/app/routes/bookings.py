from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import get_current_user
from app.schemas.booking import BookingCreateRequest, BookingListResponse, BookingResponse
from app.schemas.user import CurrentUser
from app.services.audit_log import write_audit_log
from app.services.booking_service import cancel_booking, create_booking, list_bookings
from app.services.realtime import get_realtime_manager

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


class PublicBookingCreateRequest(BaseModel):
    """Guest-facing booking request — no auth required."""
    table_id: Optional[str] = Field(None, description="Table ID from QR scan (optional)")
    guest_name: str = Field(..., min_length=2, max_length=200)
    party_size: int = Field(..., ge=1, le=1000)
    start_time: datetime
    duration_minutes: Optional[int] = Field(None, ge=15, le=720)
    notes: Optional[str] = Field(None, max_length=500)


def _booking_response(doc: dict) -> BookingResponse:
    return BookingResponse(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        table_id=doc["table_id"],
        guest_name=doc["guest_name"],
        party_size=doc["party_size"],
        start_time=doc["start_time"],
        end_time=doc["end_time"],
        status=doc.get("status", "reserved"),
        notes=doc.get("notes"),
        created_by=doc.get("created_by"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )


@router.get("", response_model=BookingListResponse)
async def list_all_bookings(
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
) -> BookingListResponse:
    items, total = await list_bookings(
        current_user.restaurant_id, start, end, limit, skip
    )
    return BookingListResponse(items=[_booking_response(doc) for doc in items], total=total)


@router.post("", response_model=BookingResponse)
async def create_booking_endpoint(
    payload: BookingCreateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> BookingResponse:
    try:
        doc = await create_booking(
            current_user.restaurant_id, payload.model_dump(), current_user.id
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "booking.create",
        "booking",
        resource_id=str(doc["_id"]),
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id,
        {"type": "booking.created", "data": _booking_response(doc).model_dump()},
    )
    return _booking_response(doc)


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking_endpoint(
    booking_id: str,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> BookingResponse:
    doc = await cancel_booking(current_user.restaurant_id, booking_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "booking.cancel",
        "booking",
        resource_id=str(doc["_id"]),
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id,
        {"type": "booking.cancelled", "data": _booking_response(doc).model_dump()},
    )
    return _booking_response(doc)


@router.post("/public/{restaurant_id}", response_model=BookingResponse)
async def create_public_booking_endpoint(
    restaurant_id: str,
    payload: PublicBookingCreateRequest,
) -> BookingResponse:
    """Public endpoint for guests to create bookings without authentication."""
    # Build a dict compatible with create_booking service
    data = {
        "table_id": payload.table_id or "walk-in",
        "guest_name": payload.guest_name,
        "party_size": payload.party_size,
        "start_time": payload.start_time,
        "duration_minutes": payload.duration_minutes or 90,
        "notes": payload.notes,
    }
    try:
        doc = await create_booking(restaurant_id, data, created_by="guest")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    manager = get_realtime_manager()
    await manager.broadcast(
        restaurant_id,
        {"type": "booking.created", "data": _booking_response(doc).model_dump()},
    )
    return _booking_response(doc)
