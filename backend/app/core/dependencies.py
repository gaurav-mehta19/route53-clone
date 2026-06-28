"""Shared FastAPI dependencies — extracted to keep routers thin."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.models.user import User
from app.services import auth as auth_service


def _extract_bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Missing bearer token.")
    return authorization.split(" ", 1)[1].strip()


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    token = _extract_bearer(authorization)
    return auth_service.resolve_session(db, token=token)


def get_current_token(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    return _extract_bearer(authorization)


CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[Session, Depends(get_db)]
BearerToken = Annotated[str, Depends(get_current_token)]
