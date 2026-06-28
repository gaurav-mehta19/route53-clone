"""Bootstrap the apex NS + SOA records Route53 auto-creates with every zone.

Bypasses the validation-heavy records service — values here are server-controlled
and already canonical, and the writes participate in the zone-creation
transaction so a partial failure rolls everything back.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.ids import record_id
from app.models.hosted_zone import HostedZone
from app.repositories import dns_record as record_repo

_DEFAULT_NS = (
    "ns-1.awsdns-clone.com.\n"
    "ns-2.awsdns-clone.net.\n"
    "ns-3.awsdns-clone.org.\n"
    "ns-4.awsdns-clone.co.uk."
)
_DEFAULT_SOA = (
    "ns-1.awsdns-clone.com. awsdns-hostmaster.amazon.com. "
    "1 7200 900 1209600 86400"
)


def create_default_records(db: Session, zone: HostedZone) -> int:
    """Insert apex NS + SOA. Returns the number of records inserted."""
    record_repo.create(
        db,
        record_id=record_id(),
        zone_id=zone.id,
        name=zone.name,
        record_type="NS",
        ttl=172800,
        value=_DEFAULT_NS,
    )
    record_repo.create(
        db,
        record_id=record_id(),
        zone_id=zone.id,
        name=zone.name,
        record_type="SOA",
        ttl=900,
        value=_DEFAULT_SOA,
    )
    zone.record_count = (zone.record_count or 0) + 2
    return 2
