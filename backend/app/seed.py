"""Seed the database with demo data.

Usage::

    .venv/bin/python -m app.seed

Idempotent: re-running won't duplicate the demo user or zones. DNS records
seeded in Phase 4 once the records service exists.
"""

from __future__ import annotations

from typing import TypedDict

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.security import hash_password
from app.models.user import User
from app.repositories import user as user_repo
from app.services import hosted_zone as zone_service


class _ZoneSpec(TypedDict):
    name: str
    type: str
    comment: str | None


DEMO_ZONES: list[_ZoneSpec] = [
    {"name": "example.com.", "type": "PUBLIC", "comment": "Marketing site"},
    {"name": "internal.example.com.", "type": "PRIVATE", "comment": "VPC private DNS"},
    {"name": "shop.example.net.", "type": "PUBLIC", "comment": "Storefront"},
    {"name": "api.example.io.", "type": "PUBLIC", "comment": None},
]


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
        except Exception as exc:
            print(f"[seed] skipped {spec['name']} ({spec['type']}): {exc}")


def main() -> None:
    init_db()
    with SessionLocal() as db:
        user = seed_demo_user(db)
        seed_demo_zones(db, user)


if __name__ == "__main__":
    main()
