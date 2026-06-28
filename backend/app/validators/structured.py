"""Validators for record types with structured values: TXT, MX, SRV, CAA."""

from __future__ import annotations

import re
from collections.abc import Callable

from app.core.exceptions import ValidationFailedError
from app.validators.hostname import normalize_hostname

_CAA_TAGS = {"issue", "issuewild", "iodef"}

# A TXT value should be one or more quoted strings; we accept loose forms and
# canonicalize each to its quoted, escape-safe representation.
_TXT_CHUNK = re.compile(r'"((?:[^"\\]|\\.)*)"')


def validate_txt(raw: str) -> str:
    s = raw.strip()
    if not s:
        raise ValidationFailedError("value: TXT record cannot be empty.")
    parts = _TXT_CHUNK.findall(s) if s.startswith('"') else [s]
    out: list[str] = []
    for chunk in parts:
        if len(chunk) > 255:
            raise ValidationFailedError("value: each TXT string must be <= 255 chars.")
        escaped = chunk.replace("\\", "\\\\").replace('"', '\\"')
        out.append(f'"{escaped}"')
    return " ".join(out)


def _validate_mx_line(line: str) -> str:
    parts = line.split()
    if len(parts) != 2:
        raise ValidationFailedError(f"value: MX entry '{line}' must be 'priority hostname'.")
    prio_raw, host = parts
    try:
        prio = int(prio_raw)
    except ValueError as exc:
        raise ValidationFailedError(f"value: MX priority '{prio_raw}' is not an integer.") from exc
    if not 0 <= prio <= 65535:
        raise ValidationFailedError("value: MX priority must be between 0 and 65535.")
    return f"{prio} {normalize_hostname(host)}"


def _validate_srv_line(line: str) -> str:
    parts = line.split()
    if len(parts) != 4:
        raise ValidationFailedError(
            f"value: SRV entry '{line}' must be 'priority weight port target'."
        )
    nums = parts[:3]
    target = parts[3]
    try:
        prio, weight, port = (int(x) for x in nums)
    except ValueError as exc:
        raise ValidationFailedError("value: SRV priority/weight/port must be integers.") from exc
    for label, val in (("priority", prio), ("weight", weight)):
        if not 0 <= val <= 65535:
            raise ValidationFailedError(f"value: SRV {label} must be 0..65535.")
    if not 1 <= port <= 65535:
        raise ValidationFailedError("value: SRV port must be 1..65535.")
    return f"{prio} {weight} {port} {normalize_hostname(target)}"


def _validate_caa_line(line: str) -> str:
    parts = line.split(maxsplit=2)
    if len(parts) != 3:
        raise ValidationFailedError(f"value: CAA entry '{line}' must be 'flags tag value'.")
    flags_raw, tag, value = parts
    try:
        flags = int(flags_raw)
    except ValueError as exc:
        raise ValidationFailedError(f"value: CAA flags '{flags_raw}' is not an integer.") from exc
    if not 0 <= flags <= 255:
        raise ValidationFailedError("value: CAA flags must be 0..255.")
    if tag.lower() not in _CAA_TAGS:
        raise ValidationFailedError(f"value: CAA tag must be one of {sorted(_CAA_TAGS)}.")
    quoted = value if value.startswith('"') and value.endswith('"') else f'"{value}"'
    return f"{flags} {tag.lower()} {quoted}"


def _multi_line(raw: str, line_fn: Callable[[str], str]) -> str:
    lines = [ln.strip() for ln in raw.replace("\r\n", "\n").split("\n") if ln.strip()]
    if not lines:
        raise ValidationFailedError("value: at least one entry is required.")
    return "\n".join(line_fn(ln) for ln in lines)


def validate_mx(raw: str) -> str:
    return _multi_line(raw, _validate_mx_line)


def validate_srv(raw: str) -> str:
    return _multi_line(raw, _validate_srv_line)


def validate_caa(raw: str) -> str:
    return _multi_line(raw, _validate_caa_line)
