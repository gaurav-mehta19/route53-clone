"""Hosted-zones CRUD + pagination/search/filter/sort + auth + conflict tests."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient

API = "/api/hosted-zones"


def _unique_name() -> str:
    return f"z-{uuid.uuid4().hex[:8]}.example.com."


def test_list_requires_auth(client: TestClient) -> None:
    r = client.get(API)
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "unauthorized"


def test_create_get_update_delete(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    name = _unique_name()
    r = client.post(
        API,
        json={"name": name, "type": "PUBLIC", "comment": "hi"},
        headers=auth_headers,
    )
    assert r.status_code == 201
    zone = r.json()
    assert zone["id"].startswith("Z") and len(zone["id"]) == 21
    assert zone["name"] == name
    assert zone["type"] == "PUBLIC"
    # Auto-created NS + SOA records.
    assert zone["record_count"] == 2

    zid = zone["id"]
    r = client.get(f"{API}/{zid}", headers=auth_headers)
    assert r.status_code == 200 and r.json()["id"] == zid

    r = client.patch(f"{API}/{zid}", json={"comment": "updated"}, headers=auth_headers)
    assert r.status_code == 200 and r.json()["comment"] == "updated"

    r = client.delete(f"{API}/{zid}", headers=auth_headers)
    assert r.status_code == 204

    r = client.get(f"{API}/{zid}", headers=auth_headers)
    assert r.status_code == 404 and r.json()["error"]["code"] == "not_found"


def test_duplicate_zone_name_type_conflicts(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    name = _unique_name()
    r1 = client.post(API, json={"name": name, "type": "PUBLIC"}, headers=auth_headers)
    assert r1.status_code == 201
    r2 = client.post(API, json={"name": name, "type": "PUBLIC"}, headers=auth_headers)
    assert r2.status_code == 409 and r2.json()["error"]["code"] == "conflict"


def test_domain_validation(client: TestClient, auth_headers: dict[str, str]) -> None:
    r = client.post(API, json={"name": "not a domain", "type": "PUBLIC"}, headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "validation_failed"


def test_pagination_search_filter_sort(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    created: list[str] = []
    for i in range(5):
        n = f"paged-{i}-{uuid.uuid4().hex[:6]}.example.com."
        r = client.post(API, json={"name": n, "type": "PUBLIC"}, headers=auth_headers)
        assert r.status_code == 201
        created.append(r.json()["id"])

    # Filter to PRIVATE; expect 0 (we just made PUBLIC zones).
    r = client.get(API, params={"type": "PRIVATE"}, headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert all(z["type"] == "PRIVATE" for z in body["items"])

    # Search by substring (matches one of the just-created zone names).
    sample = created[0]
    r = client.get(API, params={"search": sample[:10]}, headers=auth_headers)
    assert r.status_code == 200
    assert any(z["id"] == sample for z in r.json()["items"])

    # Sort by name asc; verify monotonic ordering on this page.
    r = client.get(
        API,
        params={"page_size": 100, "sort": "name:asc"},
        headers=auth_headers,
    )
    assert r.status_code == 200
    names = [z["name"] for z in r.json()["items"]]
    assert names == sorted(names)

    # Pagination: page_size=2 → at most 2 items, total >= 5.
    r = client.get(API, params={"page": 1, "page_size": 2}, headers=auth_headers)
    body = r.json()
    assert r.status_code == 200
    assert body["page"] == 1 and body["page_size"] == 2 and len(body["items"]) == 2
    assert body["total"] >= 5
