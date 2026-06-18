from __future__ import annotations

from datetime import datetime

from typing import List

from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    uploaded_at: datetime


class ProgressPoint(BaseModel):
    interview_id: int
    title: str
    created_at: datetime
    overall_score: int
    speaking_rate: float
    filler_count: int


class UserProgressResponse(BaseModel):
    total_interviews: int
    completed_interviews: int
    average_score: float
    average_speaking_rate: float
    average_filler_count: float
    history: List[ProgressPoint]
