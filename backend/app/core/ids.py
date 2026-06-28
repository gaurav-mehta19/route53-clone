"""Route53-style ID generators.

Hosted zones look like ``Z`` + 20 uppercase base32 chars (e.g. ``Z3K6ABC...``).
Records use a similar prefixed-base32 form so they sort lexicographically.
"""

from __future__ import annotations

import base64
import secrets


def _base32(byte_count: int, length: int) -> str:
    raw = secrets.token_bytes(byte_count)
    encoded = base64.b32encode(raw).decode("ascii").rstrip("=").upper()
    return encoded[:length]


def hosted_zone_id() -> str:
    return "Z" + _base32(byte_count=16, length=20)


def record_id() -> str:
    return "R" + _base32(byte_count=16, length=20)
