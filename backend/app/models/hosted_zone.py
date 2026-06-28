"""HostedZone ORM model.

Composite unique constraint on (created_by, name, type) mirrors Route53:
the same user can't own two zones with the same domain + visibility.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class HostedZone(Base, TimestampMixin):
    __tablename__ = "hosted_zones"
    __table_args__ = (
        UniqueConstraint("created_by", "name", "type", name="uq_hosted_zone_name_type_user"),
        Index("ix_hosted_zone_created_by", "created_by"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(16), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    record_count: Mapped[int] = mapped_column(default=0, nullable=False)
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    owner: Mapped[User] = relationship()
    # `records` relationship added in Phase 4 when DnsRecord lands.
