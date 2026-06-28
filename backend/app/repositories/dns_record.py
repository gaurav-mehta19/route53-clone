"""DnsRecord repository — sole DB-access layer for records."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord

SORTABLE: dict[str, object] = {
    "name": DnsRecord.name,
    "type": DnsRecord.type,
    "ttl": DnsRecord.ttl,
    "created_at": DnsRecord.created_at,
}


def _base_query(*, zone_id: str) -> Select[tuple[DnsRecord]]:
    return select(DnsRecord).where(DnsRecord.hosted_zone_id == zone_id)


def list_paged(
    db: Session,
    *,
    zone_id: str,
    page: int,
    page_size: int,
    search: str | None = None,
    record_type: str | None = None,
    sort_field: str = "name",
    sort_dir: str = "asc",
) -> tuple[Sequence[DnsRecord], int]:
    stmt = _base_query(zone_id=zone_id)
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(or_(DnsRecord.name.ilike(like), DnsRecord.value.ilike(like)))
    if record_type:
        stmt = stmt.where(DnsRecord.type == record_type)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    column = SORTABLE.get(sort_field, DnsRecord.name)
    ordering = column.desc() if sort_dir == "desc" else column.asc()  # type: ignore[attr-defined]
    stmt = stmt.order_by(ordering, DnsRecord.type.asc()).offset((page - 1) * page_size).limit(
        page_size
    )

    items = db.scalars(stmt).all()
    return items, int(total)


def get(db: Session, *, record_id: str) -> DnsRecord | None:
    return db.get(DnsRecord, record_id)


def get_by_zone_name_type(
    db: Session, *, zone_id: str, name: str, record_type: str
) -> DnsRecord | None:
    stmt = _base_query(zone_id=zone_id).where(
        DnsRecord.name == name, DnsRecord.type == record_type
    )
    return db.scalars(stmt).first()


def create(
    db: Session,
    *,
    record_id: str,
    zone_id: str,
    name: str,
    record_type: str,
    ttl: int,
    value: str,
    routing_policy: str = "SIMPLE",
) -> DnsRecord:
    rec = DnsRecord(
        id=record_id,
        hosted_zone_id=zone_id,
        name=name,
        type=record_type,
        ttl=ttl,
        value=value,
        routing_policy=routing_policy,
    )
    db.add(rec)
    db.flush()
    db.refresh(rec)
    return rec


def update(db: Session, rec: DnsRecord, *, ttl: int | None, value: str | None) -> DnsRecord:
    if ttl is not None:
        rec.ttl = ttl
    if value is not None:
        rec.value = value
    db.flush()
    db.refresh(rec)
    return rec


def delete(db: Session, rec: DnsRecord) -> None:
    db.delete(rec)
    db.flush()
