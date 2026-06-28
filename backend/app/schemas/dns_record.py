"""DNS-record request and response schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# User-creatable record types. SOA is auto-managed by the zone bootstrap and
# cannot be created/edited via the records API, but it is returned in reads.
CreatableRecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]
RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"]
RoutingPolicy = Literal["SIMPLE"]


class DnsRecordCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: CreatableRecordType
    ttl: int = Field(default=300, ge=0, le=604_800)
    value: str = Field(min_length=1)
    routing_policy: RoutingPolicy = "SIMPLE"


class DnsRecordUpdate(BaseModel):
    """All fields optional; the service applies a partial patch."""

    ttl: int | None = Field(default=None, ge=0, le=604_800)
    value: str | None = Field(default=None, min_length=1)


class DnsRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hosted_zone_id: str
    name: str
    type: RecordType
    ttl: int
    value: str
    routing_policy: RoutingPolicy
    created_at: datetime
    updated_at: datetime
