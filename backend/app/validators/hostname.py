"""Hostname / domain-label validation primitives shared by several record types."""

from __future__ import annotations

import re

from app.core.exceptions import ValidationFailedError

# RFC 1035 label, allows trailing dot for FQDN form.
_HOSTNAME_RE = re.compile(
    r"^(?=.{1,253}\.?$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?$",
    re.IGNORECASE,
)


def normalize_hostname(raw: str, *, field: str = "value") -> str:
    """Lowercase, trim, ensure trailing dot — and reject malformed hostnames."""
    if raw is None:
        raise ValidationFailedError(f"{field}: hostname is required.")
    h = raw.strip().lower()
    if not h:
        raise ValidationFailedError(f"{field}: hostname is required.")
    if not h.endswith("."):
        h += "."
    if not _HOSTNAME_RE.match(h):
        raise ValidationFailedError(f"{field}: '{raw}' is not a valid hostname.")
    return h
