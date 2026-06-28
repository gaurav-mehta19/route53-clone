"""Password hashing and session-token primitives for the mock auth flow."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return str(_pwd_context.hash(plain))


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bool(_pwd_context.verify(plain, hashed))
    except Exception:
        return False


def generate_token() -> str:
    """Opaque, URL-safe random session token."""
    return secrets.token_urlsafe(32)


def session_expiry(ttl_seconds: int) -> datetime:
    return datetime.now(UTC) + timedelta(seconds=ttl_seconds)


def is_expired(expires_at: datetime) -> bool:
    """Naive-aware safe comparison: assume naive timestamps are UTC."""
    now = datetime.now(UTC)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    return expires_at <= now
