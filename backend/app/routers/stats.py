"""Dashboard stats endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DbSession
from app.schemas.stats import ActivityRead, DailyBucketRead, UserStatsRead
from app.services import activity as activity_service
from app.services import stats as stats_service

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=UserStatsRead)
def get_stats(user: CurrentUser, db: DbSession) -> UserStatsRead:
    stats = stats_service.for_user(db, user_id=user.id)
    return UserStatsRead(
        total_zones=stats.total_zones,
        public_zones=stats.public_zones,
        private_zones=stats.private_zones,
        total_records=stats.total_records,
    )


@router.get("/activity", response_model=ActivityRead)
def get_activity(
    user: CurrentUser,
    db: DbSession,
    days: Annotated[int, Query(ge=1, le=90)] = 7,
) -> ActivityRead:
    buckets = activity_service.records_created_last_n_days(db, user_id=user.id, days=days)
    return ActivityRead(
        buckets=[
            DailyBucketRead(day=b.day, records_created=b.records_created) for b in buckets
        ]
    )
