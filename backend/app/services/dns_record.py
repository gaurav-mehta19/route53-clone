"""DNS-record business logic — validation, dup checks, record_count maintenance."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.ids import record_id as new_record_id
from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.repositories import dns_record as record_repo
from app.repositories import hosted_zone as zone_repo
from app.validators.registry import normalize_record_name, validate_ttl, validate_value


def list_records(
    db: Session,
    *,
    zone: HostedZone,
    page: int,
    page_size: int,
    search: str | None,
    record_type: str | None,
    sort_field: str,
    sort_dir: str,
) -> tuple[list[DnsRecord], int]:
    items, total = record_repo.list_paged(
        db,
        zone_id=zone.id,
        page=page,
        page_size=page_size,
        search=search,
        record_type=record_type,
        sort_field=sort_field,
        sort_dir=sort_dir,
    )
    return list(items), total


def get_record(db: Session, *, record_id: str) -> DnsRecord:
    rec = record_repo.get(db, record_id=record_id)
    if rec is None:
        raise NotFoundError(f"Record {record_id} not found.")
    return rec


def create_record(
    db: Session,
    *,
    zone: HostedZone,
    name: str,
    record_type: str,
    ttl: int,
    value: str,
    routing_policy: str = "SIMPLE",
) -> DnsRecord:
    canonical_name = normalize_record_name(name, zone_name=zone.name)
    canonical_value = validate_value(
        record_type, value, name=canonical_name, zone_name=zone.name
    )
    validate_ttl(ttl)

    if record_repo.get_by_zone_name_type(
        db, zone_id=zone.id, name=canonical_name, record_type=record_type
    ):
        raise ConflictError(
            f"A {record_type} record already exists for {canonical_name} in this zone."
        )

    rec = record_repo.create(
        db,
        record_id=new_record_id(),
        zone_id=zone.id,
        name=canonical_name,
        record_type=record_type,
        ttl=ttl,
        value=canonical_value,
        routing_policy=routing_policy,
    )
    zone.record_count += 1
    zone_repo.update(db, zone, comment=zone.comment)
    db.commit()
    db.refresh(rec)
    return rec


def update_record(
    db: Session,
    *,
    record_id: str,
    ttl: int | None,
    value: str | None,
) -> DnsRecord:
    rec = get_record(db, record_id=record_id)
    if ttl is not None:
        validate_ttl(ttl)
    if value is not None:
        value = validate_value(rec.type, value, name=rec.name, zone_name=rec.hosted_zone.name)
    record_repo.update(db, rec, ttl=ttl, value=value)
    db.commit()
    db.refresh(rec)
    return rec


def delete_record(db: Session, *, record_id: str) -> None:
    rec = get_record(db, record_id=record_id)
    zone = rec.hosted_zone
    record_repo.delete(db, rec)
    zone.record_count = max(0, zone.record_count - 1)
    zone_repo.update(db, zone, comment=zone.comment)
    db.commit()
