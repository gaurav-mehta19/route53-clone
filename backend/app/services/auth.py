"""Auth business logic — orchestrates user lookup, password check, and sessions."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import (
    generate_token,
    is_expired,
    session_expiry,
    verify_password,
)
from app.models.session import UserSession
from app.models.user import User
from app.repositories import session as session_repo
from app.repositories import user as user_repo


def login(db: Session, *, email: str, password: str) -> tuple[User, UserSession]:
    """Verify credentials and mint a server-side session row."""
    user = user_repo.get_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid email or password.")

    settings = get_settings()
    token = generate_token()
    sess = session_repo.create(
        db,
        user_id=user.id,
        token=token,
        expires_at=session_expiry(settings.session_ttl_seconds),
    )
    db.commit()
    return user, sess


def logout(db: Session, *, token: str) -> None:
    """Revoke the session backing `token` (idempotent)."""
    session_repo.delete_by_token(db, token)
    db.commit()


def resolve_session(db: Session, *, token: str) -> User:
    """Return the User behind a bearer token, raising 401 on invalid/expired."""
    sess = session_repo.get_by_token(db, token)
    if sess is None:
        raise UnauthorizedError("Invalid or expired session token.")
    if is_expired(sess.expires_at):
        session_repo.delete_by_token(db, token)
        db.commit()
        raise UnauthorizedError("Invalid or expired session token.")
    return sess.user
