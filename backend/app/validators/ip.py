"""IPv4 / IPv6 validation for A and AAAA records."""

from __future__ import annotations

import ipaddress

from app.core.exceptions import ValidationFailedError


def validate_a(raw: str) -> str:
    try:
        ip = ipaddress.IPv4Address(raw.strip())
    except (ValueError, ipaddress.AddressValueError) as exc:
        raise ValidationFailedError(f"value: '{raw}' is not a valid IPv4 address.") from exc
    return str(ip)


def validate_aaaa(raw: str) -> str:
    try:
        ip = ipaddress.IPv6Address(raw.strip())
    except (ValueError, ipaddress.AddressValueError) as exc:
        raise ValidationFailedError(f"value: '{raw}' is not a valid IPv6 address.") from exc
    return ip.compressed
