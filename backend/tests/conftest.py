"""Shared test fixtures — isolated SQLite per test session."""

from __future__ import annotations

import os
import tempfile
from collections.abc import Iterator
from pathlib import Path

import pytest

# Point the app at a temp DB *before* the app/db modules import.
_TMP_DIR = tempfile.mkdtemp(prefix="route53-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_TMP_DIR) / 'test.db'}"

from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import SessionLocal, init_db  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app.repositories import user as user_repo  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _bootstrap_db() -> Iterator[None]:
    init_db()
    with SessionLocal() as db:
        if user_repo.get_by_email(db, "demo@example.com") is None:
            user_repo.create(
                db,
                email="demo@example.com",
                password_hash=hash_password("demo1234"),
                display_name="Demo User",
            )
            db.commit()
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    r = client.post(
        "/api/auth/login",
        json={"email": "demo@example.com", "password": "demo1234"},
    )
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}
