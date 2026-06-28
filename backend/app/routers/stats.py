"""Dashboard stats endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DbSession
from app.schemas.stats import UserStatsRead
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
