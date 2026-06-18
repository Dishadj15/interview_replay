from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.interview import Interview, InterviewStatus
from app.models.report import Report
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse, TimelineEvent, TimelineResponse, TranscriptResponse
from app.services.interview_service import InterviewService


class AnalyticsService:
    @staticmethod
    def get_report(db: Session, user: User, interview_id: int) -> Report:
        interview = InterviewService.get_interview(db, user, interview_id)
        if interview.status != InterviewStatus.completed or not interview.report:
            raise NotFoundError("Analytics not available for this interview")
        return interview.report

    @staticmethod
    def get_analytics(db: Session, user: User, interview_id: int) -> AnalyticsResponse:
        report = AnalyticsService.get_report(db, user, interview_id)
        return AnalyticsResponse(
            interview_id=report.interview_id,
            filler_count=report.filler_count,
            filler_word_breakdown=json.loads(report.filler_word_breakdown),
            speaking_rate=report.speaking_rate,
            pause_count=report.pause_count,
            pauses=json.loads(report.pauses),
            feedback=report.feedback,
            overall_score=report.overall_score,
        )

    @staticmethod
    def get_transcript(db: Session, user: User, interview_id: int) -> TranscriptResponse:
        interview = InterviewService.get_interview(db, user, interview_id)
        if not interview.transcript or not interview.report:
            raise NotFoundError("Transcript not available for this interview")

        return TranscriptResponse(
            interview_id=interview.id,
            full_text=interview.transcript,
            word_timestamps=json.loads(interview.report.word_timestamps),
        )

    @staticmethod
    def get_timeline(db: Session, user: User, interview_id: int) -> TimelineResponse:
        interview = InterviewService.get_interview(db, user, interview_id)
        report = interview.report
        if not report:
            raise NotFoundError("Timeline not available for this interview")

        events: list[TimelineEvent] = []
        filler_breakdown = json.loads(report.filler_word_breakdown)
        word_timestamps = json.loads(report.word_timestamps)

        for word_data in word_timestamps:
            word = str(word_data.get("word", "")).lower().strip(".,!?")
            if word in filler_breakdown:
                events.append(
                    TimelineEvent(
                        type="filler",
                        start_seconds=float(word_data["start"]),
                        end_seconds=float(word_data["end"]),
                        label=word,
                        severity="medium",
                    )
                )

        for pause in json.loads(report.pauses):
            events.append(
                TimelineEvent(
                    type="pause",
                    start_seconds=float(pause["start_seconds"]),
                    end_seconds=float(pause["end_seconds"]),
                    label=f"{pause['duration_seconds']}s pause",
                    severity="low" if pause["duration_seconds"] < 2 else "high",
                )
            )

        events.sort(key=lambda event: event.start_seconds)
        return TimelineResponse(interview_id=interview.id, events=events)
