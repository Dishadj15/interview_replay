from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.interview import Interview, InterviewStatus
from app.models.report import Report
from app.models.user import User
from app.schemas.resume import ProgressPoint, UserProgressResponse
from app.services.processing_service import AnalysisResult, ProcessingService


class ProgressService:
    @staticmethod
    def get_user_progress(db: Session, user: User) -> UserProgressResponse:
        interviews = (
            db.query(Interview)
            .filter(
                Interview.user_id == user.id,
                Interview.deleted_at.is_(None),
            )
            .order_by(Interview.created_at.asc())
            .all()
        )

        completed = [item for item in interviews if item.status == InterviewStatus.completed and item.report]
        history: list[ProgressPoint] = []

        for interview in completed:
            report = interview.report
            if not report:
                continue
            history.append(
                ProgressPoint(
                    interview_id=interview.id,
                    title=interview.title,
                    created_at=interview.created_at,
                    overall_score=report.overall_score,
                    speaking_rate=report.speaking_rate,
                    filler_count=report.filler_count,
                )
            )

        if not completed:
            return UserProgressResponse(
                total_interviews=len(interviews),
                completed_interviews=0,
                average_score=0.0,
                average_speaking_rate=0.0,
                average_filler_count=0.0,
                history=history,
            )

        average_score = sum(item.report.overall_score for item in completed if item.report) / len(completed)
        average_speaking_rate = sum(item.report.speaking_rate for item in completed if item.report) / len(completed)
        average_filler_count = sum(item.report.filler_count for item in completed if item.report) / len(completed)

        return UserProgressResponse(
            total_interviews=len(interviews),
            completed_interviews=len(completed),
            average_score=round(average_score, 1),
            average_speaking_rate=round(average_speaking_rate, 1),
            average_filler_count=round(average_filler_count, 1),
            history=history,
        )


class InterviewProcessingRunner:
    @staticmethod
    def run(db: Session, interview_id: int) -> None:
        interview = db.get(Interview, interview_id)
        if not interview or interview.deleted_at is not None:
            return

        interview.status = InterviewStatus.processing
        interview.progress_pct = 10
        interview.error_message = None
        db.commit()

        try:
            interview.progress_pct = 35
            db.commit()

            result: AnalysisResult = ProcessingService.process_interview(interview.file_path)

            interview.progress_pct = 80
            interview.transcript = result.transcript
            interview.duration_seconds = result.duration_seconds
            db.commit()

            existing_report = db.query(Report).filter(Report.interview_id == interview.id).first()
            if existing_report:
                db.delete(existing_report)
                db.commit()

            report = Report(
                interview_id=interview.id,
                filler_count=result.filler_count,
                filler_word_breakdown=ProcessingService.serialize_json(result.filler_word_breakdown),
                speaking_rate=result.speaking_rate,
                pause_count=result.pause_count,
                pauses=ProcessingService.serialize_json(result.pauses),
                word_timestamps=ProcessingService.serialize_json(result.word_timestamps),
                feedback=result.feedback,
                overall_score=result.overall_score,
            )
            db.add(report)

            interview.status = InterviewStatus.completed
            interview.progress_pct = 100
            db.commit()
        except Exception as exc:
            interview.status = InterviewStatus.failed
            interview.progress_pct = 100
            interview.error_message = str(exc)
            db.commit()
