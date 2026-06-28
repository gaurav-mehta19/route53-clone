"""FastAPI application factory — middleware, exception handlers, routes."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.exceptions import register_exception_handlers
from app.repositories import user as user_repo
from app.routers import auth as auth_router
from app.routers import dns_records as dns_records_router
from app.routers import hosted_zones as hosted_zones_router
from app.routers import stats as stats_router
from app.seed import seed_demo_user, seed_demo_zones


def _bootstrap_demo_data() -> None:
    """Seed demo user + zones + records on first boot.

    Render's free tier has an ephemeral disk: the SQLite DB resets on every
    redeploy, which would otherwise wipe both the demo credentials shown on
    the login page and the seeded zones. The presence of the demo user is
    the cheap "already seeded" check — once it exists we skip everything so
    warm boots stay fast and idempotent.
    """
    settings = get_settings()
    with SessionLocal() as db:
        if user_repo.get_by_email(db, settings.demo_email) is not None:
            return
        user = seed_demo_user(db)
        seed_demo_zones(db, user)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    _bootstrap_demo_data()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex or None,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    register_exception_handlers(app)

    @app.get("/api/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(auth_router.router)
    app.include_router(hosted_zones_router.router)
    app.include_router(dns_records_router.zone_router)
    app.include_router(dns_records_router.router)
    app.include_router(stats_router.router)

    return app


app = create_app()
