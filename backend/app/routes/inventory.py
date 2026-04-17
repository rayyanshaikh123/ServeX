from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import get_current_user
from app.schemas.menu import MenuCreateRequest, MenuListResponse, MenuResponse, MenuUpdateRequest
from app.schemas.user import CurrentUser
from app.services.audit_log import write_audit_log
from app.services.inventory_service import (
    create_menu_item,
    delete_menu_item,
    get_menu_item,
    list_menu_items,
    update_menu_item,
)

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


def _menu_response(doc: dict) -> MenuResponse:
    return MenuResponse(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        name=doc["name"],
        price=doc["price"],
        isVeg=doc.get("isVeg", True),
        spiceLevel=doc.get("spiceLevel", "Medium"),
        tags=doc.get("tags") or [],
        stock=doc.get("stock", 0),
        low_stock_threshold=doc.get("low_stock_threshold", 0),
        time_to_cook=doc.get("time_to_cook", 0),
        embedding_status=doc.get("embedding_status"),
        embedding_error=doc.get("embedding_error"),
        embedding_updated_at=doc.get("embedding_updated_at"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )


@router.get("/menu", response_model=MenuListResponse)
async def list_menu(
    low_stock_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
) -> MenuListResponse:
    items, total = await list_menu_items(
        current_user.restaurant_id, low_stock_only, limit, skip
    )
    return MenuListResponse(items=[_menu_response(doc) for doc in items], total=total)


@router.get("/menu/{item_id}", response_model=MenuResponse)
async def get_menu(
    item_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> MenuResponse:
    doc = await get_menu_item(current_user.restaurant_id, item_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _menu_response(doc)


@router.post("/menu", response_model=MenuResponse)
async def create_menu(
    payload: MenuCreateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> MenuResponse:
    doc = await create_menu_item(current_user.restaurant_id, payload.model_dump())
    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "menu.create",
        "menu",
        resource_id=str(doc["_id"]),
        metadata={"name": doc["name"], "price": doc["price"]},
    )
    return _menu_response(doc)


@router.patch("/menu/{item_id}", response_model=MenuResponse)
async def update_menu(
    item_id: str,
    payload: MenuUpdateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> MenuResponse:
    doc = await update_menu_item(
        current_user.restaurant_id, item_id, payload.model_dump(exclude_unset=True)
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "menu.update",
        "menu",
        resource_id=str(doc["_id"]),
    )
    return _menu_response(doc)


@router.delete("/menu/{item_id}")
async def delete_menu(
    item_id: str,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> dict:
    deleted = await delete_menu_item(current_user.restaurant_id, item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "menu.delete",
        "menu",
        resource_id=item_id,
    )
    return {"status": "deleted"}
