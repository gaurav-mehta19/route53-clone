"""Seed the database with demo data.

Usage::

    .venv/bin/python -m app.seed

Idempotent: re-running won't duplicate the demo user. Hosted zones/records
are seeded once the corresponding modules exist (later phases).
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.security import hash_password
from app.repositories import user as user_repo


def seed_demo_user(db: Session) -> None:
    settings = get_settings()
    existing = user_repo.get_by_email(db, settings.demo_email)
    if existing is not None:
        print(f"[seed] demo user already exists: {settings.demo_email}")
        return
    user_repo.create(
        db,
        email=settings.demo_email,
        password_hash=hash_password(settings.demo_password),
        display_name=settings.demo_display_name,
    )
    db.commit()
    print(f"[seed] created demo user: {settings.demo_email} / {settings.demo_password}")


def main() -> None:
    init_db()
    with SessionLocal() as db:
        seed_demo_user(db)


if __name__ == "__main__":
    main()
