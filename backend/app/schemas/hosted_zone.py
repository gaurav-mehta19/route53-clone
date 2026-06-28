"""Hosted-zone request and response schemas."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

ZoneType = Literal["PUBLIC", "PRIVATE"]

# Loose DNS label validation — accepts trailing dot (Route53 stores names with one).
_DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?$",
    re.IGNORECASE,
)


def _normalize_domain(value: str) -> str:
    name = value.strip().lower()
    if not name.endswith("."):
        name += "."
    if not _DOMAIN_RE.match(name):
        raise ValueError("Invalid domain name.")
    return name


class HostedZoneCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: ZoneType = "PUBLIC"
    comment: str | None = Field(default=None, max_length=1024)

    @field_validator("name")
    @classmethod
    def _normalize(cls, v: str) -> str:
        return _normalize_domain(v)


class HostedZoneUpdate(BaseModel):
    comment: str | None = Field(default=None, max_length=1024)


class HostedZoneRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: ZoneType
    comment: str | None
    record_count: int
    created_by: int
    created_at: datetime
    updated_at: datetime
