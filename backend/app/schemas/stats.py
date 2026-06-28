from __future__ import annotations

from pydantic import BaseModel


class UserStatsRead(BaseModel):
    total_zones: int
    public_zones: int
    private_zones: int
    total_records: int
