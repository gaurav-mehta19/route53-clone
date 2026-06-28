"""DNS-records HTTP layer.

Exposes two routers:
- ``zone_router`` mounted under ``/api/hosted-zones/{zone_id}/records``: list + create.
- ``router``     mounted at ``/api/records``: get / patch / delete by id.

Splitting the prefixes keeps URL shapes Route53-style — list scoped under
the zone, individual ops addressable directly.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import CurrentUser, DbSession
from app.core.exceptions import NotFoundError
from app.models.dns_record import DnsRecord
from app.schemas.dns_record import (
    CreatableRecordType,
    DnsRecordCreate,
    DnsRecordRead,
    DnsRecordUpdate,
)
from app.schemas.pagination import Page, PageParams
from app.services import dns_record as record_service
from app.services import hosted_zone as zone_service

zone_router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["records"])
router = APIRouter(prefix="/api/records", tags=["records"])

_SORT_ALLOW = {"name", "type", "ttl", "created_at"}


def _resolve_sort(raw: str | None) -> tuple[str, str]:
    parsed = PageParams(sort=raw).parsed_sort()
    if not parsed:
        return "name", "asc"
    field, direction = parsed
    if field not in _SORT_ALLOW:
        return "name", "asc"
    return field, direction


@zone_router.get("", response_model=Page[DnsRecordRead])
def list_records(
    zone_id: str,
    user: CurrentUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 25,
    search: str | None = None,
    type: CreatableRecordType | None = None,
    sort: str | None = None,
) -> Page[DnsRecordRead]:
    zone = zone_service.get_zone(db, user_id=user.id, zone_id=zone_id)
    field, direction = _resolve_sort(sort)
    items, total = record_service.list_records(
        db,
        zone=zone,
        page=page,
        page_size=page_size,
        search=search,
        record_type=type,
        sort_field=field,
        sort_dir=direction,
    )
    return Page[DnsRecordRead](
        items=[DnsRecordRead.model_validate(r) for r in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@zone_router.post("", response_model=DnsRecordRead, status_code=status.HTTP_201_CREATED)
def create_record(
    zone_id: str, payload: DnsRecordCreate, user: CurrentUser, db: DbSession
) -> DnsRecordRead:
    zone = zone_service.get_zone(db, user_id=user.id, zone_id=zone_id)
    rec = record_service.create_record(
        db,
        zone=zone,
        name=payload.name,
        record_type=payload.type,
        ttl=payload.ttl,
        value=payload.value,
        routing_policy=payload.routing_policy,
    )
    return DnsRecordRead.model_validate(rec)


def _owned_record(db: Session, user_id: int, record_id: str) -> DnsRecord:
    """Treat a record we don't own as 404 to avoid leaking existence."""
    rec = record_service.get_record(db, record_id=record_id)
    if rec.hosted_zone.created_by != user_id:
        raise NotFoundError(f"Record {record_id} not found.")
    return rec


@router.get("/{record_id}", response_model=DnsRecordRead)
def get_record(record_id: str, user: CurrentUser, db: DbSession) -> DnsRecordRead:
    return DnsRecordRead.model_validate(_owned_record(db, user.id, record_id))


@router.patch("/{record_id}", response_model=DnsRecordRead)
def update_record(
    record_id: str, payload: DnsRecordUpdate, user: CurrentUser, db: DbSession
) -> DnsRecordRead:
    _owned_record(db, user.id, record_id)
    updated = record_service.update_record(
        db, record_id=record_id, ttl=payload.ttl, value=payload.value
    )
    return DnsRecordRead.model_validate(updated)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: str, user: CurrentUser, db: DbSession) -> None:
    _owned_record(db, user.id, record_id)
    record_service.delete_record(db, record_id=record_id)
