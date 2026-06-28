"""User repository — the only place that touches the DB for users."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email.lower())
    return db.scalars(stmt).first()


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def create(db: Session, *, email: str, password_hash: str, display_name: str) -> User:
    user = User(email=email.lower(), password_hash=password_hash, display_name=display_name)
    db.add(user)
    db.flush()
    db.refresh(user)
    return user
