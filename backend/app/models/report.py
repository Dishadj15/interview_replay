from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.interview import Interview


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    interview_id: Mapped[int] = mapped_column(
        ForeignKey("interviews.id", ondelete="CASCADE"), unique=True, index=True
    )
    filler_count: Mapped[int] = mapped_column(Integer, default=0)
    filler_word_breakdown: Mapped[str] = mapped_column(Text, default="{}")
    speaking_rate: Mapped[float] = mapped_column(Float, default=0.0)
    pause_count: Mapped[int] = mapped_column(Integer, default=0)
    pauses: Mapped[str] = mapped_column(Text, default="[]")
    word_timestamps: Mapped[str] = mapped_column(Text, default="[]")
    feedback: Mapped[str] = mapped_column(Text, default="")
    overall_score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    interview: Mapped["Interview"] = relationship(back_populates="report")
