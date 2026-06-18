from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class PauseEvent(BaseModel):
    start_seconds: float
    end_seconds: float
    duration_seconds: float


class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float


class AnalyticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    interview_id: int
    filler_count: int
    filler_word_breakdown: dict[str, int]
    speaking_rate: float
    pause_count: int
    pauses: List[PauseEvent]
    feedback: str
    overall_score: int


class TranscriptResponse(BaseModel):
    interview_id: int
    full_text: str
    word_timestamps: List[WordTimestamp]


class TimelineEvent(BaseModel):
    type: str
    start_seconds: float
    end_seconds: float
    label: str
    severity: Optional[str] = None


class TimelineResponse(BaseModel):
    interview_id: int
    events: List[TimelineEvent]
