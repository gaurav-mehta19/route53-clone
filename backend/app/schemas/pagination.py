"""Reusable pagination + sort/search request and response schemas."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PageParams(BaseModel):
    """Common query params for paginated list endpoints."""

    page: int = Field(1, ge=1)
    page_size: int = Field(25, ge=1, le=200)
    search: str | None = None
    sort: str | None = None  # e.g. "name:asc" or "created_at:desc"

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    def parsed_sort(self) -> tuple[str, str] | None:
        if not self.sort:
            return None
        if ":" in self.sort:
            field, direction = self.sort.split(":", 1)
        else:
            field, direction = self.sort, "asc"
        direction = direction.lower()
        if direction not in {"asc", "desc"}:
            direction = "asc"
        return field.strip(), direction


class Page(BaseModel, Generic[T]):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    items: list[T]
    page: int
    page_size: int
    total: int

    @property
    def total_pages(self) -> int:
        if self.page_size == 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size
