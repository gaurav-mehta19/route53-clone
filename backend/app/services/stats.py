"""Aggregate counts powering the dashboard tiles.

Implemented as a thin service over `hosted_zone_repo` so the dashboard can
ask one question and get one answer instead of paging the whole zone list.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone


@dataclass(frozen=True)
class UserStats:
    total_zones: int
    public_zones: int
    private_zones: int
    total_records: int


def for_user(db: Session, *, user_id: int) -> UserStats:
    rows = db.execute(
        select(
            func.count(HostedZone.id),
            func.coalesce(func.sum(HostedZone.record_count), 0),
            func.coalesce(func.sum(
                case((HostedZone.type == "PUBLIC", 1), else_=0)
            ), 0),
            func.coalesce(func.sum(
                case((HostedZone.type == "PRIVATE", 1), else_=0)
            ), 0),
        ).where(HostedZone.created_by == user_id)
    ).one()
    total, records, public_, private_ = rows
    return UserStats(
        total_zones=int(total),
        public_zones=int(public_),
        private_zones=int(private_),
        total_records=int(records),
    )
