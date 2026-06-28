"""DnsRecord ORM model — records belong to a HostedZone (cascade on delete)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.hosted_zone import HostedZone


class DnsRecord(Base, TimestampMixin):
    __tablename__ = "dns_records"
    __table_args__ = (
        Index("ix_dns_record_zone_name_type", "hosted_zone_id", "name", "type"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    hosted_zone_id: Mapped[str] = mapped_column(
        ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(16), nullable=False)
    ttl: Mapped[int] = mapped_column(nullable=False, default=300)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    routing_policy: Mapped[str] = mapped_column(String(32), nullable=False, default="SIMPLE")

    hosted_zone: Mapped[HostedZone] = relationship(back_populates="records")
