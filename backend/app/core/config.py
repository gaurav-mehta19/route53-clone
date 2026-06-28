"""Application configuration loaded from env vars."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Top-level app settings. Override via env vars or `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Route53 Clone API"
    debug: bool = False

    database_url: str = "sqlite:///./route53_clone.db"

    # Token expiry for the mock auth flow (24h is fine for a demo console).
    session_ttl_seconds: int = 60 * 60 * 24

    # CORS — frontend dev origin by default.
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Demo credentials surfaced on the login page.
    demo_email: str = "demo@example.com"
    demo_password: str = "demo1234"
    demo_display_name: str = "Demo User"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cache settings so the env is only parsed once per process."""
    return Settings()
