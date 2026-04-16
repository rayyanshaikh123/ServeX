from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import get_current_user
from app.schemas.payment import PaymentCreateRequest, PaymentResponse, PaymentVerifyRequest
from app.schemas.user import CurrentUser
from app.services.payment_service import create_payment_order, handle_webhook, verify_payment

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/order")
async def create_order(
    payload: PaymentCreateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> dict:
    try:
        return await create_payment_order(current_user.restaurant_id, payload.order_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/verify", response_model=PaymentResponse)
async def verify_payment_endpoint(
    payload: PaymentVerifyRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> PaymentResponse:
    try:
        record = await verify_payment(current_user.restaurant_id, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    return PaymentResponse(
        id=str(record["_id"]),
        restaurant_id=record["restaurant_id"],
        order_id=record["order_id"],
        razorpay_order_id=record["razorpay_order_id"],
        razorpay_payment_id=record.get("razorpay_payment_id"),
        status=record.get("status", "created"),
        amount=record.get("amount", 0),
        currency=record.get("currency", "INR"),
        created_at=record.get("created_at"),
        updated_at=record.get("updated_at"),
    )


@router.post("/webhook")
async def webhook(request: Request) -> dict:
    body = await request.body()
    try:
        return await handle_webhook(dict(request.headers), body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
