"""Per-type DNS value validators + record-level rules (TTL, apex, in-zone).

This module is the single source of truth the records service consults; the
frontend mirrors the same rules via zod (Phase 6).
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from app.core.exceptions import ValidationFailedError
from app.validators.hostname import normalize_hostname
from app.validators.ip import validate_a, validate_aaaa
from app.validators.structured import validate_caa, validate_mx, validate_srv, validate_txt


def _single_hostname(raw: str) -> str:
    return normalize_hostname(raw.strip())


def _multi_hostname(raw: str) -> str:
    lines = [ln.strip() for ln in raw.replace("\r\n", "\n").split("\n") if ln.strip()]
    if not lines:
        raise ValidationFailedError("value: at least one hostname is required.")
    return "\n".join(normalize_hostname(ln) for ln in lines)


@dataclass(frozen=True)
class RecordTypeSpec:
    validate_value: Callable[[str], str]
    apex_allowed: bool = True


SPECS: dict[str, RecordTypeSpec] = {
    "A": RecordTypeSpec(validate_a),
    "AAAA": RecordTypeSpec(validate_aaaa),
    "CNAME": RecordTypeSpec(_single_hostname, apex_allowed=False),
    "TXT": RecordTypeSpec(validate_txt),
    "MX": RecordTypeSpec(validate_mx),
    "NS": RecordTypeSpec(_multi_hostname),
    "PTR": RecordTypeSpec(_single_hostname),
    "SRV": RecordTypeSpec(validate_srv),
    "CAA": RecordTypeSpec(validate_caa),
}

ALLOWED_TYPES: list[str] = sorted(SPECS.keys())

TTL_MIN = 0
TTL_MAX = 604_800  # one week — Route53's hard limit.


def validate_ttl(ttl: int) -> int:
    if not isinstance(ttl, int) or isinstance(ttl, bool):
        raise ValidationFailedError("ttl: must be an integer.")
    if not TTL_MIN <= ttl <= TTL_MAX:
        raise ValidationFailedError(f"ttl: must be between {TTL_MIN} and {TTL_MAX}.")
    return ttl


def normalize_record_name(raw: str, *, zone_name: str) -> str:
    """Resolve @/empty to apex, lowercase, ensure trailing dot, enforce in-zone.

    Matches the Route53 console UX: a relative name like ``www`` is interpreted
    as a subdomain of the zone (``www.example.com.``); a fully-qualified name
    that doesn't fall inside the zone is rejected.
    """
    raw_stripped = raw.strip().lower()
    if raw_stripped in ("", "@"):
        return zone_name

    fqdn = raw_stripped if raw_stripped.endswith(".") else f"{raw_stripped}."
    if fqdn == zone_name or fqdn.endswith(f".{zone_name}"):
        return fqdn

    # Fall back to a relative-name interpretation (Route53 console convenience):
    # "www" with zone "example.com." -> "www.example.com.".
    if not raw_stripped.endswith("."):
        relative = f"{raw_stripped}.{zone_name}"
        if relative.endswith(f".{zone_name}") or relative == zone_name:
            return relative

    raise ValidationFailedError(f"name: '{raw}' is not within zone {zone_name}.")


def validate_value(record_type: str, raw_value: str, *, name: str, zone_name: str) -> str:
    spec = SPECS.get(record_type)
    if spec is None:
        raise ValidationFailedError(
            f"type: '{record_type}' is not a supported record type."
        )
    if not spec.apex_allowed and name == zone_name:
        raise ValidationFailedError(
            f"type: {record_type} records are not allowed at the zone apex."
        )
    return spec.validate_value(raw_value)
