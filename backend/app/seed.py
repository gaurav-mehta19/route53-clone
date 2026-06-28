"""Seed the database with demo data.

Usage::

    .venv/bin/python -m app.seed

Idempotent: re-running won't duplicate the demo user, zones, or records.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.security import hash_password
from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.repositories import user as user_repo
from app.seed_data import ACTIVITY_PATTERN, DEMO_RECORDS, DEMO_ZONES
from app.services import dns_record as record_service
from app.services import hosted_zone as zone_service


def seed_demo_user(db: Session) -> User:
    settings = get_settings()
    existing = user_repo.get_by_email(db, settings.demo_email)
    if existing is not None:
        print(f"[seed] demo user already exists: {settings.demo_email}")
        return existing
    user = user_repo.create(
        db,
        email=settings.demo_email,
        password_hash=hash_password(settings.demo_password),
        display_name=settings.demo_display_name,
    )
    db.commit()
    print(f"[seed] created demo user: {settings.demo_email} / {settings.demo_password}")
    return user


def _seed_records(db: Session, zone: HostedZone) -> None:
    for spec in DEMO_RECORDS.get(zone.name, []):
        try:
            record_service.create_record(
                db,
                zone=zone,
                name=spec["name"],
                record_type=spec["type"],
                ttl=spec["ttl"],
                value=spec["value"],
            )
            print(f"  [seed]   + {spec['type']:<6} {spec['name']}")
        except Exception as exc:
            print(f"  [seed]   ! skip {spec['type']} {spec['name']}: {exc}")


def _backdate_for_activity_chart(db: Session, user: User) -> None:
    """Spread record `created_at` across the last 7 days so the activity
    sparkline has shape on a fresh demo. Without this, every timestamp
    clusters on day 0 and the chart shows a single spike on the right.
    """
    now = datetime.now(UTC)
    records = db.scalars(
        select(DnsRecord)
        .join(HostedZone, HostedZone.id == DnsRecord.hosted_zone_id)
        .where(HostedZone.created_by == user.id)
        .order_by(DnsRecord.id)
    ).all()

    # pattern[0] records land on day -6, pattern[1] on day -5, …, pattern[-1] on day 0.
    days_ago_per_record: list[int] = []
    for i, count in enumerate(ACTIVITY_PATTERN):
        days_ago_per_record.extend([len(ACTIVITY_PATTERN) - 1 - i] * count)

    for idx, rec in enumerate(records):
        days_ago = days_ago_per_record[idx % len(days_ago_per_record)]
        ts = now - timedelta(days=days_ago, hours=(idx * 3) % 18)
        rec.created_at = ts
        rec.updated_at = ts
    db.commit()
    print(f"[seed] backdated {len(records)} records across {len(ACTIVITY_PATTERN)} days")


def seed_demo_zones(db: Session, user: User) -> None:
    for spec in DEMO_ZONES:
        try:
            zone = zone_service.create_zone(
                db,
                user_id=user.id,
                name=spec["name"],
                zone_type=spec["type"],
                comment=spec["comment"],
            )
            print(f"[seed] created zone {zone.id} {zone.name} ({zone.type})")
            _seed_records(db, zone)
        except Exception as exc:
            print(f"[seed] skipped {spec['name']} ({spec['type']}): {exc}")
    _backdate_for_activity_chart(db, user)


def main() -> None:
    init_db()
    with SessionLocal() as db:
        user = seed_demo_user(db)
        seed_demo_zones(db, user)


if __name__ == "__main__":
    main()
