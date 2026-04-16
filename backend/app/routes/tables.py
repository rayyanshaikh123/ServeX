from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.rbac import require_roles
from app.core.roles import Role
from app.core.security import get_current_user
from app.schemas.table import TableCreateRequest, TableListResponse, TableResponse, TableUpdateRequest
from app.schemas.user import CurrentUser
from app.services.audit_log import write_audit_log
from app.services.realtime import get_realtime_manager
from app.services.table_service import create_table, delete_table, get_table, list_tables, update_table

router = APIRouter(prefix="/api/tables", tags=["tables"])


def _table_response(doc: dict) -> TableResponse:
    return TableResponse(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        name=doc["name"],
        capacity=doc["capacity"],
        status=doc.get("status", "free"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )


@router.get("", response_model=TableListResponse)
async def list_all_tables(
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
) -> TableListResponse:
    items, total = await list_tables(current_user.restaurant_id, limit, skip)
    return TableListResponse(items=[_table_response(doc) for doc in items], total=total)


@router.get("/{table_id}", response_model=TableResponse)
async def get_single_table(
    table_id: str,
    current_user: CurrentUser = Depends(get_current_user),
) -> TableResponse:
    doc = await get_table(current_user.restaurant_id, table_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _table_response(doc)


@router.post("", response_model=TableResponse)
async def create_table_endpoint(
    payload: TableCreateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> TableResponse:
    doc = await create_table(current_user.restaurant_id, payload.model_dump())
    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "table.create",
        "table",
        resource_id=str(doc["_id"]),
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id, {"type": "table.created", "data": _table_response(doc).model_dump()}
    )
    return _table_response(doc)


@router.patch("/{table_id}", response_model=TableResponse)
async def update_table_endpoint(
    table_id: str,
    payload: TableUpdateRequest,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> TableResponse:
    doc = await update_table(
        current_user.restaurant_id, table_id, payload.model_dump(exclude_unset=True)
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "table.update",
        "table",
        resource_id=str(doc["_id"]),
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id, {"type": "table.updated", "data": _table_response(doc).model_dump()}
    )
    return _table_response(doc)


@router.delete("/{table_id}")
async def delete_table_endpoint(
    table_id: str,
    current_user: CurrentUser = Depends(require_roles(Role.owner, Role.admin)),
) -> dict:
    deleted = await delete_table(current_user.restaurant_id, table_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await write_audit_log(
        current_user.restaurant_id,
        current_user.id,
        "table.delete",
        "table",
        resource_id=table_id,
    )
    manager = get_realtime_manager()
    await manager.broadcast(
        current_user.restaurant_id, {"type": "table.deleted", "data": {"id": table_id}}
    )
    return {"status": "deleted"}
