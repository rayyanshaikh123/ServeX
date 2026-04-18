import logging

logger = logging.getLogger(__name__)
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import get_current_user
from app.schemas.invoice import InvoiceResponse
from app.schemas.order import (
    OrderCreateRequest,
    OrderListResponse,
    OrderResponse,
    OrderStatusUpdateRequest,
)
from app.schemas.user import CurrentUser
from app.services.audit_log import write_audit_log
from app.services.invoice_service import create_or_get_invoice
from app.services.order_service import create_order, get_order, list_orders, update_order_status
from app.services.realtime import get_realtime_manager

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _order_response(doc: dict) -> OrderResponse:
    return OrderResponse(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        table_id=doc.get("table_id"),
        status=doc.get("status", "pending"),
        items=doc.get("items") or [],
        subtotal=doc.get("subtotal", 0),
        tax=doc.get("tax", 0),
        total=doc.get("total", 0),
        currency=doc.get("currency", "INR"),
        notes=doc.get("notes"),
        created_by=doc.get("created_by"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )


def _invoice_response(doc: dict) -> InvoiceResponse:
    return InvoiceResponse(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        order_id=doc["order_id"],
        invoice_number=doc["invoice_number"],
        subtotal=doc["subtotal"],
        tax=doc["tax"],
        total=doc["total"],
        currency=doc.get("currency", "INR"),
        storage_backend=doc.get("storage_backend", "local"),
        file_path=doc.get("file_path"),
        file_url=doc.get("file_url"),
        created_at=doc.get("created_at"),
    )


@router.get("", response_model=OrderListResponse)
async def list_orders_endpoint(
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
) -> OrderListResponse:
    items, total = await list_orders(
        current_user.restaurant_id, status_filter, limit, skip
    )
    return OrderListResponse(items=[_order_response(doc) for doc in items], total=total)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_endpoint(
    order_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> OrderResponse:
    doc = await get_order(current_user.restaurant_id, order_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _order_response(doc)


@router.post("", response_model=OrderResponse)
async def create_order_endpoint(
    payload: OrderCreateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> OrderResponse:
    try:
        doc = await create_order(
            current_user.restaurant_id, payload.model_dump(), current_user.id
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "order.create",
        "order",
        resource_id=str(doc["_id"]),
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id,
        {"type": "order.created", "data": _order_response(doc).model_dump()},
    )
    return _order_response(doc)


@router.post("/{order_id}/status", response_model=OrderResponse)
async def update_order_status_endpoint(
    order_id: str,
    payload: OrderStatusUpdateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> OrderResponse:
    try:
        doc = await update_order_status(
            current_user.restaurant_id, order_id, payload.status
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "order.status",
        "order",
        resource_id=order_id,
        metadata={"status": payload.status},
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id,
        {"type": "order.updated", "data": _order_response(doc).model_dump()},
    )

    # Auto-generate invoice when served; transition to paid to count revenue
    if payload.status == "served":
        try:
            invoice_doc = await create_or_get_invoice(current_user.restaurant_id, order_id)
            await manager.broadcast(
                current_user.restaurant_id,
                {"type": "invoice.created", "data": _invoice_response(invoice_doc).model_dump()},
            )
        except Exception as e:
            logger.error(f"Failed to auto-generate invoice for order {order_id}: {e}")

    if payload.status == "paid":
        # Broadcast revenue update so owner dashboard can refresh
        await manager.broadcast(
            current_user.restaurant_id,
            {"type": "revenue.updated", "data": {"order_id": order_id, "total": doc.get("total", 0)}},
        )
        logger.info(f"Order {order_id} completed — revenue updated for {current_user.restaurant_id}")

    return _order_response(doc)


@router.post("/{order_id}/invoice", response_model=InvoiceResponse)
async def generate_invoice_endpoint(
    order_id: str,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> InvoiceResponse:
    try:
        doc = await create_or_get_invoice(current_user.restaurant_id, order_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "invoice.create",
        "invoice",
        resource_id=str(doc["_id"]),
        metadata={"order_id": order_id},
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id,
        {"type": "invoice.created", "data": _invoice_response(doc).model_dump()},
    )
    return _invoice_response(doc)
@router.post("/public/{restaurant_id}", response_model=OrderResponse)
async def create_public_order_endpoint(
    restaurant_id: str,
    payload: OrderCreateRequest,
) -> OrderResponse:
    """Public endpoint for guests to place orders without authentication."""
    try:
        doc = await create_order(
            restaurant_id, payload.model_dump(), created_by=f"guest-table-{payload.table_id or 'unknown'}"
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    manager = get_realtime_manager()
    await manager.broadcast(
        restaurant_id,
        {"type": "order.created", "data": _order_response(doc).model_dump()},
    )
    return _order_response(doc)
