"""Seed the database with demo data.

Usage::

    .venv/bin/python -m app.seed

Idempotent: re-running won't duplicate the demo user, zones, or records.
"""

from __future__ import annotations

from typing import TypedDict

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.security import hash_password
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.repositories import user as user_repo
from app.services import dns_record as record_service
from app.services import hosted_zone as zone_service


class _ZoneSpec(TypedDict):
    name: str
    type: str
    comment: str | None


class _RecordSpec(TypedDict):
    name: str
    type: str
    ttl: int
    value: str


DEMO_ZONES: list[_ZoneSpec] = [
    {"name": "example.com.", "type": "PUBLIC", "comment": "Marketing site"},
    {"name": "internal.example.com.", "type": "PRIVATE", "comment": "VPC private DNS"},
    {"name": "shop.example.net.", "type": "PUBLIC", "comment": "Storefront"},
    {"name": "api.example.io.", "type": "PUBLIC", "comment": None},
]

DEMO_RECORDS: dict[str, list[_RecordSpec]] = {
    "example.com.": [
        {"name": "www.example.com.", "type": "A", "ttl": 300, "value": "203.0.113.10"},
        {"name": "blog.example.com.", "type": "CNAME", "ttl": 300, "value": "www.example.com."},
        {"name": "example.com.", "type": "MX", "ttl": 3600, "value": "10 mail.example.com."},
        {
            "name": "example.com.",
            "type": "TXT",
            "ttl": 300,
            "value": '"v=spf1 include:_spf.example.com ~all"',
        },
    ],
    "shop.example.net.": [
        {"name": "shop.example.net.", "type": "A", "ttl": 60, "value": "203.0.113.42"},
        {"name": "cdn.shop.example.net.", "type": "AAAA", "ttl": 300, "value": "2001:db8::1"},
    ],
    "api.example.io.": [
        {"name": "api.example.io.", "type": "A", "ttl": 60, "value": "198.51.100.7"},
    ],
}


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


def main() -> None:
    init_db()
    with SessionLocal() as db:
        user = seed_demo_user(db)
        seed_demo_zones(db, user)


if __name__ == "__main__":
    main()
