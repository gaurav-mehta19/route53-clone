"""HostedZone repository — sole DB-access layer for zones."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone

# Server-side sortable columns. The router maps unknown fields to a default.
SORTABLE: dict[str, object] = {
    "name": HostedZone.name,
    "type": HostedZone.type,
    "created_at": HostedZone.created_at,
    "record_count": HostedZone.record_count,
}


def _base_query(*, user_id: int) -> Select[tuple[HostedZone]]:
    return select(HostedZone).where(HostedZone.created_by == user_id)


def _apply_filters(
    stmt: Select[tuple[HostedZone]],
    *,
    search: str | None,
    zone_type: str | None,
) -> Select[tuple[HostedZone]]:
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(or_(HostedZone.name.ilike(like), HostedZone.id.ilike(like)))
    if zone_type:
        stmt = stmt.where(HostedZone.type == zone_type)
    return stmt


def list_paged(
    db: Session,
    *,
    user_id: int,
    page: int,
    page_size: int,
    search: str | None = None,
    zone_type: str | None = None,
    sort_field: str = "created_at",
    sort_dir: str = "desc",
) -> tuple[Sequence[HostedZone], int]:
    stmt = _apply_filters(_base_query(user_id=user_id), search=search, zone_type=zone_type)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    column = SORTABLE.get(sort_field, HostedZone.created_at)
    ordering = column.desc() if sort_dir == "desc" else column.asc()  # type: ignore[attr-defined]
    stmt = stmt.order_by(ordering).offset((page - 1) * page_size).limit(page_size)

    items = db.scalars(stmt).all()
    return items, int(total)


def get(db: Session, *, user_id: int, zone_id: str) -> HostedZone | None:
    stmt = _base_query(user_id=user_id).where(HostedZone.id == zone_id)
    return db.scalars(stmt).first()


def get_by_name_type(db: Session, *, user_id: int, name: str, zone_type: str) -> HostedZone | None:
    stmt = _base_query(user_id=user_id).where(
        HostedZone.name == name, HostedZone.type == zone_type
    )
    return db.scalars(stmt).first()


def create(
    db: Session,
    *,
    zone_id: str,
    user_id: int,
    name: str,
    zone_type: str,
    comment: str | None,
) -> HostedZone:
    zone = HostedZone(
        id=zone_id,
        created_by=user_id,
        name=name,
        type=zone_type,
        comment=comment,
        record_count=0,
    )
    db.add(zone)
    db.flush()
    db.refresh(zone)
    return zone


def update(db: Session, zone: HostedZone, *, comment: str | None) -> HostedZone:
    zone.comment = comment
    db.flush()
    db.refresh(zone)
    return zone


def delete(db: Session, zone: HostedZone) -> None:
    db.delete(zone)
    db.flush()
