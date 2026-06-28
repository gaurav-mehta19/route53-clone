"""Hosted-zone business logic — orchestrates ID gen, dedup, ownership checks."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.ids import hosted_zone_id
from app.models.hosted_zone import HostedZone
from app.repositories import hosted_zone as zone_repo
from app.services.zone_bootstrap import create_default_records


def list_zones(
    db: Session,
    *,
    user_id: int,
    page: int,
    page_size: int,
    search: str | None,
    zone_type: str | None,
    sort_field: str,
    sort_dir: str,
) -> tuple[list[HostedZone], int]:
    items, total = zone_repo.list_paged(
        db,
        user_id=user_id,
        page=page,
        page_size=page_size,
        search=search,
        zone_type=zone_type,
        sort_field=sort_field,
        sort_dir=sort_dir,
    )
    return list(items), total


def get_zone(db: Session, *, user_id: int, zone_id: str) -> HostedZone:
    zone = zone_repo.get(db, user_id=user_id, zone_id=zone_id)
    if zone is None:
        raise NotFoundError(f"Hosted zone {zone_id} not found.")
    return zone


def create_zone(
    db: Session,
    *,
    user_id: int,
    name: str,
    zone_type: str,
    comment: str | None,
) -> HostedZone:
    existing = zone_repo.get_by_name_type(db, user_id=user_id, name=name, zone_type=zone_type)
    if existing is not None:
        raise ConflictError(f"You already own a {zone_type.lower()} zone named {name}.")

    zone = zone_repo.create(
        db,
        zone_id=hosted_zone_id(),
        user_id=user_id,
        name=name,
        zone_type=zone_type,
        comment=comment,
    )
    create_default_records(db, zone)
    db.commit()
    db.refresh(zone)
    return zone


def update_zone(
    db: Session, *, user_id: int, zone_id: str, comment: str | None
) -> HostedZone:
    zone = get_zone(db, user_id=user_id, zone_id=zone_id)
    zone_repo.update(db, zone, comment=comment)
    db.commit()
    db.refresh(zone)
    return zone


def delete_zone(db: Session, *, user_id: int, zone_id: str) -> None:
    zone = get_zone(db, user_id=user_id, zone_id=zone_id)
    zone_repo.delete(db, zone)
    db.commit()
