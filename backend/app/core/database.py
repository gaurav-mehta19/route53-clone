"""SQLAlchemy engine, session factory, declarative base, and FastAPI dep."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime

from sqlalchemy import DateTime, create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from app.core.config import get_settings


def _make_engine() -> Engine:
    url = get_settings().database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, future=True, connect_args=connect_args)


engine: Engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Project-wide declarative base."""


def _now() -> datetime:
    return datetime.now(UTC)


class TimestampMixin:
    """Adds created_at/updated_at columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )


def get_db() -> Iterator[Session]:
    """FastAPI dependency: hand out a session and close it after the request."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    """Create all tables. Idempotent — fine to call on every boot."""
    # Import models so SQLAlchemy registers them on the metadata before create_all.
    from app import models  # noqa: F401  (side-effect import)

    Base.metadata.create_all(bind=engine)
