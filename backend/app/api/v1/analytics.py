from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse, TimelineResponse, TranscriptResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["analytics"])


@router.get("/interviews/{interview_id}/analytics", response_model=AnalyticsResponse)
def get_analytics(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsResponse:
    return AnalyticsService.get_analytics(db, current_user, interview_id)


@router.get("/interviews/{interview_id}/transcript", response_model=TranscriptResponse)
def get_transcript(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TranscriptResponse:
    return AnalyticsService.get_transcript(db, current_user, interview_id)


@router.get("/interviews/{interview_id}/timeline", response_model=TimelineResponse)
def get_timeline(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TimelineResponse:
    return AnalyticsService.get_timeline(db, current_user, interview_id)
