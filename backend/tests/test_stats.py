"""Dashboard stats endpoint — sums match the zone list."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient


def test_stats_reflects_created_zones_and_records(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    before = client.get("/api/stats", headers=auth_headers).json()

    name = f"stats-{uuid.uuid4().hex[:8]}.example.com."
    r = client.post(
        "/api/hosted-zones",
        json={"name": name, "type": "PUBLIC"},
        headers=auth_headers,
    )
    assert r.status_code == 201
    zone_id = r.json()["id"]

    r = client.post(
        f"/api/hosted-zones/{zone_id}/records",
        json={"name": "www", "type": "A", "ttl": 60, "value": "10.0.0.1"},
        headers=auth_headers,
    )
    assert r.status_code == 201

    after = client.get("/api/stats", headers=auth_headers).json()
    assert after["total_zones"] == before["total_zones"] + 1
    assert after["public_zones"] == before["public_zones"] + 1
    # +2 NS/SOA from zone create, +1 A from the explicit create.
    assert after["total_records"] == before["total_records"] + 3
