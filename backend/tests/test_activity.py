"""/api/stats/activity returns one bucket per day with the right count."""

from __future__ import annotations

import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient


def test_activity_returns_one_bucket_per_day_with_today_count(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    # Create a zone (auto-adds 2 records: NS + SOA) and one extra record.
    name = f"act-{uuid.uuid4().hex[:8]}.example.com."
    zone = client.post(
        "/api/hosted-zones",
        json={"name": name, "type": "PUBLIC"},
        headers=auth_headers,
    ).json()
    client.post(
        f"/api/hosted-zones/{zone['id']}/records",
        json={"name": "www", "type": "A", "ttl": 60, "value": "10.0.0.1"},
        headers=auth_headers,
    )

    r = client.get("/api/stats/activity?days=7", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert len(body["buckets"]) == 7

    # Buckets are oldest-first and cover today.
    days = [date.fromisoformat(b["day"]) for b in body["buckets"]]
    assert days[-1] - days[0] == timedelta(days=6)

    # Today's bucket has at least the 3 records we just created.
    today_bucket = body["buckets"][-1]
    assert today_bucket["records_created"] >= 3


def test_activity_clamps_days_param(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    assert client.get("/api/stats/activity?days=0", headers=auth_headers).status_code == 422
    assert client.get("/api/stats/activity?days=200", headers=auth_headers).status_code == 422
