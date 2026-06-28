"""Bucketed activity stats for the dashboard chart.

Returns the count of records the user has created in each of the last N days.
Real data (no synthetic numbers) — derived from the existing `created_at`
timestamps on `dns_records` joined to the owning hosted zones.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone


@dataclass(frozen=True)
class DailyBucket:
    day: date
    records_created: int


def records_created_last_n_days(
    db: Session, *, user_id: int, days: int = 7
) -> list[DailyBucket]:
    """Return one bucket per day, oldest first, including zero-count days."""
    now = datetime.now(UTC)
    start = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)

    rows = db.execute(
        select(
            func.date(DnsRecord.created_at).label("day"),
            func.count(DnsRecord.id).label("n"),
        )
        .join(HostedZone, HostedZone.id == DnsRecord.hosted_zone_id)
        .where(HostedZone.created_by == user_id)
        .where(DnsRecord.created_at >= start)
        .group_by(func.date(DnsRecord.created_at))
    ).all()

    counts: dict[date, int] = {}
    for raw_day, n in rows:
        d = raw_day if isinstance(raw_day, date) else date.fromisoformat(str(raw_day))
        counts[d] = int(n)

    out: list[DailyBucket] = []
    for offset in range(days):
        d = (start + timedelta(days=offset)).date()
        out.append(DailyBucket(day=d, records_created=counts.get(d, 0)))
    return out
