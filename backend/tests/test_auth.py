"""Auth flow: login → me → logout, plus error envelope shape."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_login_and_me_and_logout(client: TestClient) -> None:
    r = client.post(
        "/api/auth/login",
        json={"email": "demo@example.com", "password": "demo1234"},
    )
    assert r.status_code == 200
    token = r.json()["token"]
    assert isinstance(token, str) and len(token) > 20

    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "demo@example.com"

    r = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 204

    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "unauthorized"


def test_bad_password_returns_envelope(client: TestClient) -> None:
    r = client.post(
        "/api/auth/login",
        json={"email": "demo@example.com", "password": "nope"},
    )
    assert r.status_code == 401
    body = r.json()
    assert body == {
        "error": {"code": "unauthorized", "message": "Invalid email or password.", "details": []}
    }


def test_validation_envelope_has_field_details(client: TestClient) -> None:
    r = client.post("/api/auth/login", json={"email": "not-an-email", "password": ""})
    assert r.status_code == 422
    body = r.json()
    assert body["error"]["code"] == "validation_failed"
    fields = {d["field"] for d in body["error"]["details"]}
    assert {"email", "password"} <= fields


def test_me_without_token_is_unauthorized(client: TestClient) -> None:
    r = client.get("/api/auth/me")
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "unauthorized"
