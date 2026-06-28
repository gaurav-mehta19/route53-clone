"""Auth HTTP layer — thin: parse, call service, shape response."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.core.dependencies import BearerToken, CurrentUser, DbSession
from app.schemas.auth import LoginRequest, TokenResponse, UserRead
from app.services import auth as auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    user, sess = auth_service.login(db, email=payload.email, password=payload.password)
    return TokenResponse(token=sess.token, user=UserRead.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: BearerToken, db: DbSession) -> None:
    auth_service.logout(db, token=token)


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
