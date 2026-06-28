"""Per-record-type validator tests — both happy and error paths."""

from __future__ import annotations

import pytest

from app.core.exceptions import ValidationFailedError
from app.validators.registry import (
    normalize_record_name,
    validate_ttl,
    validate_value,
)


def _ok(rtype: str, val: str, *, name: str = "x.example.com.") -> str:
    return validate_value(rtype, val, name=name, zone_name="example.com.")


def _bad(rtype: str, val: str, *, name: str = "x.example.com.") -> None:
    with pytest.raises(ValidationFailedError):
        validate_value(rtype, val, name=name, zone_name="example.com.")


def test_a_record_validates_ipv4() -> None:
    assert _ok("A", "10.0.0.1") == "10.0.0.1"
    _bad("A", "not-an-ip")
    _bad("A", "999.0.0.1")


def test_aaaa_record_validates_ipv6() -> None:
    assert _ok("AAAA", "2001:db8::1") == "2001:db8::1"
    _bad("AAAA", "10.0.0.1")


def test_cname_blocked_at_apex_allowed_elsewhere() -> None:
    assert _ok("CNAME", "target.example.com", name="www.example.com.") == "target.example.com."
    _bad("CNAME", "target.example.com.", name="example.com.")


def test_mx_requires_priority_and_hostname() -> None:
    assert _ok("MX", "10 mail.example.com") == "10 mail.example.com."
    _bad("MX", "mail.example.com")
    _bad("MX", "99999 mail.example.com.")


def test_srv_four_field_format() -> None:
    assert _ok("SRV", "10 5 5060 sip.example.com") == "10 5 5060 sip.example.com."
    _bad("SRV", "10 5 sip.example.com")
    _bad("SRV", "10 5 0 sip.example.com")  # port must be 1..65535


def test_caa_tag_and_flags() -> None:
    out = _ok("CAA", "0 issue letsencrypt.org")
    assert out == '0 issue "letsencrypt.org"'
    _bad("CAA", "0 badtag letsencrypt.org")
    _bad("CAA", "999 issue letsencrypt.org")


def test_txt_quoted_canonicalization() -> None:
    assert _ok("TXT", "hello") == '"hello"'
    assert _ok("TXT", '"a" "b"') == '"a" "b"'
    _bad("TXT", "")


def test_ns_accepts_multiple_lines() -> None:
    out = _ok("NS", "ns1.example.com\nns2.example.com")
    assert "ns1.example.com." in out and "ns2.example.com." in out


def test_unknown_type_is_rejected() -> None:
    _bad("FOO", "anything")


def test_ttl_bounds() -> None:
    assert validate_ttl(300) == 300
    with pytest.raises(ValidationFailedError):
        validate_ttl(-1)
    with pytest.raises(ValidationFailedError):
        validate_ttl(700_000)


def test_record_name_in_zone() -> None:
    assert normalize_record_name("www", zone_name="example.com.") == "www.example.com."
    assert normalize_record_name("@", zone_name="example.com.") == "example.com."
    assert normalize_record_name("WWW.example.com", zone_name="example.com.") == "www.example.com."
    with pytest.raises(ValidationFailedError):
        normalize_record_name("www.other.com.", zone_name="example.com.")
