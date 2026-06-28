from __future__ import annotations

from datetime import date

from pydantic import BaseModel


class UserStatsRead(BaseModel):
    total_zones: int
    public_zones: int
    private_zones: int
    total_records: int


class DailyBucketRead(BaseModel):
    day: date
    records_created: int


class ActivityRead(BaseModel):
    buckets: list[DailyBucketRead]
