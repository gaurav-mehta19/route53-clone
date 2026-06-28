"""Static data + activity pattern used by `app.seed`. Split out so the
orchestration code in seed.py stays inside the 150-LOC budget."""

from __future__ import annotations

from typing import TypedDict


class ZoneSpec(TypedDict):
    name: str
    type: str
    comment: str | None


class RecordSpec(TypedDict):
    name: str
    type: str
    ttl: int
    value: str


DEMO_ZONES: list[ZoneSpec] = [
    {"name": "example.com.", "type": "PUBLIC", "comment": "Marketing site"},
    {"name": "internal.example.com.", "type": "PRIVATE", "comment": "VPC private DNS"},
    {"name": "shop.example.net.", "type": "PUBLIC", "comment": "Storefront"},
    {"name": "api.example.io.", "type": "PUBLIC", "comment": None},
]

DEMO_RECORDS: dict[str, list[RecordSpec]] = {
    "example.com.": [
        {"name": "www.example.com.", "type": "A", "ttl": 300, "value": "203.0.113.10"},
        {"name": "blog.example.com.", "type": "CNAME", "ttl": 300, "value": "www.example.com."},
        {"name": "example.com.", "type": "MX", "ttl": 3600, "value": "10 mail.example.com."},
        {
            "name": "example.com.",
            "type": "TXT",
            "ttl": 300,
            "value": '"v=spf1 include:_spf.example.com ~all"',
        },
    ],
    "shop.example.net.": [
        {"name": "shop.example.net.", "type": "A", "ttl": 60, "value": "203.0.113.42"},
        {"name": "cdn.shop.example.net.", "type": "AAAA", "ttl": 300, "value": "2001:db8::1"},
    ],
    "api.example.io.": [
        {"name": "api.example.io.", "type": "A", "ttl": 60, "value": "198.51.100.7"},
    ],
}

# How many records to backdate to each of the last 7 days, oldest -> today.
# Sum is 15 — exactly the number of seeded records (8 auto NS+SOA + 7 user).
# Ascending shape so the dashboard sparkline reads "growing usage".
ACTIVITY_PATTERN: list[int] = [1, 1, 2, 2, 3, 3, 3]
