"""Records CRUD, auto NS/SOA on zone create, record_count maintenance, ownership."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient

ZONES = "/api/hosted-zones"


def _make_zone(client: TestClient, headers: dict[str, str]) -> dict[str, object]:
    name = f"r-{uuid.uuid4().hex[:8]}.example.com."
    r = client.post(ZONES, json={"name": name, "type": "PUBLIC"}, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def test_zone_create_auto_adds_ns_and_soa(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    zone = _make_zone(client, auth_headers)
    assert zone["record_count"] == 2

    r = client.get(f"{ZONES}/{zone['id']}/records", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    types = {rec["type"] for rec in body["items"]}
    assert {"NS", "SOA"} <= types
    apex_records = [rec for rec in body["items"] if rec["name"] == zone["name"]]
    assert any(rec["type"] == "NS" for rec in apex_records)
    assert any(rec["type"] == "SOA" for rec in apex_records)


def test_record_crud_and_record_count(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    zone = _make_zone(client, auth_headers)
    zid = zone["id"]

    r = client.post(
        f"{ZONES}/{zid}/records",
        json={"name": "www", "type": "A", "ttl": 300, "value": "10.0.0.1"},
        headers=auth_headers,
    )
    assert r.status_code == 201, r.text
    rec = r.json()
    assert rec["name"] == f"www.{zone['name']}"
    assert rec["value"] == "10.0.0.1"
    rid = rec["id"]

    # Zone record_count bumps to 3 (NS+SOA+A).
    r = client.get(f"{ZONES}/{zid}", headers=auth_headers)
    assert r.status_code == 200 and r.json()["record_count"] == 3

    # Patch TTL via /api/records/{id}.
    r = client.patch(f"/api/records/{rid}", json={"ttl": 60}, headers=auth_headers)
    assert r.status_code == 200 and r.json()["ttl"] == 60

    # Delete and verify count decrements.
    r = client.delete(f"/api/records/{rid}", headers=auth_headers)
    assert r.status_code == 204
    r = client.get(f"{ZONES}/{zid}", headers=auth_headers)
    assert r.json()["record_count"] == 2


def test_duplicate_name_type_in_zone_conflicts(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    zone = _make_zone(client, auth_headers)
    payload = {"name": "dup", "type": "A", "ttl": 300, "value": "10.0.0.5"}
    r1 = client.post(f"{ZONES}/{zone['id']}/records", json=payload, headers=auth_headers)
    assert r1.status_code == 201
    r2 = client.post(f"{ZONES}/{zone['id']}/records", json=payload, headers=auth_headers)
    assert r2.status_code == 409 and r2.json()["error"]["code"] == "conflict"


def test_record_validation_errors(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    zone = _make_zone(client, auth_headers)

    # Bad IP -> ValidationFailedError -> 400 envelope.
    r = client.post(
        f"{ZONES}/{zone['id']}/records",
        json={"name": "x", "type": "A", "ttl": 300, "value": "not-ip"},
        headers=auth_headers,
    )
    assert r.status_code == 400 and r.json()["error"]["code"] == "validation_failed"

    # Out-of-zone name.
    r = client.post(
        f"{ZONES}/{zone['id']}/records",
        json={"name": "evil.other.com.", "type": "A", "ttl": 300, "value": "10.0.0.1"},
        headers=auth_headers,
    )
    assert r.status_code == 400 and r.json()["error"]["code"] == "validation_failed"

    # CNAME at apex is rejected.
    r = client.post(
        f"{ZONES}/{zone['id']}/records",
        json={"name": "@", "type": "CNAME", "ttl": 300, "value": "target.example.com."},
        headers=auth_headers,
    )
    assert r.status_code == 400 and r.json()["error"]["code"] == "validation_failed"


def test_records_list_pagination_search_filter(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    zone = _make_zone(client, auth_headers)
    for i in range(4):
        client.post(
            f"{ZONES}/{zone['id']}/records",
            json={"name": f"host{i}", "type": "A", "ttl": 300, "value": f"10.0.0.{i+1}"},
            headers=auth_headers,
        )

    # Type filter
    r = client.get(
        f"{ZONES}/{zone['id']}/records",
        params={"type": "A", "page_size": 100},
        headers=auth_headers,
    )
    body = r.json()
    assert r.status_code == 200
    assert all(rec["type"] == "A" for rec in body["items"])
    assert body["total"] == 4

    # Pagination cap
    r = client.get(
        f"{ZONES}/{zone['id']}/records",
        params={"page": 1, "page_size": 2},
        headers=auth_headers,
    )
    body = r.json()
    assert r.status_code == 200
    assert len(body["items"]) == 2 and body["total"] >= 4

    # Search by value substring
    r = client.get(
        f"{ZONES}/{zone['id']}/records",
        params={"search": "10.0.0.2"},
        headers=auth_headers,
    )
    body = r.json()
    assert any(rec["value"] == "10.0.0.2" for rec in body["items"])
