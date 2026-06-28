"""Hosted-zones HTTP layer."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentUser, DbSession
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneRead, HostedZoneUpdate, ZoneType
from app.schemas.pagination import Page, PageParams
from app.services import hosted_zone as zone_service

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])

_SORT_ALLOW = {"name", "type", "created_at", "record_count"}


def _resolve_sort(raw: str | None) -> tuple[str, str]:
    parsed = PageParams(sort=raw).parsed_sort()
    if not parsed:
        return "created_at", "desc"
    field, direction = parsed
    if field not in _SORT_ALLOW:
        return "created_at", "desc"
    return field, direction


@router.get("", response_model=Page[HostedZoneRead])
def list_zones(
    user: CurrentUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 25,
    search: str | None = None,
    type: ZoneType | None = None,
    sort: str | None = None,
) -> Page[HostedZoneRead]:
    field, direction = _resolve_sort(sort)
    items, total = zone_service.list_zones(
        db,
        user_id=user.id,
        page=page,
        page_size=page_size,
        search=search,
        zone_type=type,
        sort_field=field,
        sort_dir=direction,
    )
    return Page[HostedZoneRead](
        items=[HostedZoneRead.model_validate(z) for z in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post("", response_model=HostedZoneRead, status_code=status.HTTP_201_CREATED)
def create_zone(payload: HostedZoneCreate, user: CurrentUser, db: DbSession) -> HostedZoneRead:
    zone = zone_service.create_zone(
        db,
        user_id=user.id,
        name=payload.name,
        zone_type=payload.type,
        comment=payload.comment,
    )
    return HostedZoneRead.model_validate(zone)


@router.get("/{zone_id}", response_model=HostedZoneRead)
def get_zone(zone_id: str, user: CurrentUser, db: DbSession) -> HostedZoneRead:
    zone = zone_service.get_zone(db, user_id=user.id, zone_id=zone_id)
    return HostedZoneRead.model_validate(zone)


@router.patch("/{zone_id}", response_model=HostedZoneRead)
def update_zone(
    zone_id: str, payload: HostedZoneUpdate, user: CurrentUser, db: DbSession
) -> HostedZoneRead:
    zone = zone_service.update_zone(
        db, user_id=user.id, zone_id=zone_id, comment=payload.comment
    )
    return HostedZoneRead.model_validate(zone)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: str, user: CurrentUser, db: DbSession) -> None:
    zone_service.delete_zone(db, user_id=user.id, zone_id=zone_id)
