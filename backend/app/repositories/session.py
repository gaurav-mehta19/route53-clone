"""Session repository — owns all DB access for UserSession rows."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import CursorResult, delete, select
from sqlalchemy.orm import Session

from app.models.session import UserSession


def _rowcount(result: CursorResult[object]) -> int:
    return result.rowcount or 0


def create(db: Session, *, user_id: int, token: str, expires_at: datetime) -> UserSession:
    row = UserSession(user_id=user_id, token=token, expires_at=expires_at)
    db.add(row)
    db.flush()
    db.refresh(row)
    return row


def get_by_token(db: Session, token: str) -> UserSession | None:
    stmt = select(UserSession).where(UserSession.token == token)
    return db.scalars(stmt).first()


def delete_by_token(db: Session, token: str) -> int:
    stmt = delete(UserSession).where(UserSession.token == token)
    result = db.execute(stmt)
    assert isinstance(result, CursorResult)
    return _rowcount(result)


def purge_expired(db: Session, *, now: datetime) -> int:
    stmt = delete(UserSession).where(UserSession.expires_at <= now)
    result = db.execute(stmt)
    assert isinstance(result, CursorResult)
    return _rowcount(result)
