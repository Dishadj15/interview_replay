from __future__ import annotations

from datetime import datetime

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.interview import InterviewStatus


class InterviewCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: InterviewStatus
    original_filename: str
    created_at: datetime


class InterviewSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: InterviewStatus
    original_filename: str
    duration_seconds: Optional[float]
    progress_pct: int
    created_at: datetime


class InterviewDetail(InterviewSummary):
    file_type: str
    transcript: Optional[str]
    error_message: Optional[str]


class InterviewListResponse(BaseModel):
    items: List[InterviewSummary]
    total: int
    limit: int
    offset: int


class InterviewUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)


class ProcessingStatusResponse(BaseModel):
    status: InterviewStatus
    progress_pct: int
    eta_seconds: Optional[int] = None
    error_message: Optional[str] = None
