from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.interview import Interview, InterviewStatus
from app.models.user import User
from app.schemas.interview import InterviewDetail, InterviewListResponse, InterviewSummary, InterviewUpdate


class InterviewService:
    @staticmethod
    def _base_query(db: Session, user_id: int):
        return db.query(Interview).filter(
            Interview.user_id == user_id,
            Interview.deleted_at.is_(None),
        )

    @staticmethod
    def get_interview(db: Session, user: User, interview_id: int) -> Interview:
        interview = InterviewService._base_query(db, user.id).filter(Interview.id == interview_id).first()
        if not interview:
            raise NotFoundError("Interview not found")
        return interview

    @staticmethod
    def list_interviews(
        db: Session,
        user: User,
        *,
        status: InterviewStatus | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> InterviewListResponse:
        query = InterviewService._base_query(db, user.id)
        if status:
            query = query.filter(Interview.status == status)

        total = query.count()
        items = (
            query.order_by(Interview.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return InterviewListResponse(
            items=[InterviewSummary.model_validate(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def create_interview(
        db: Session,
        user: User,
        *,
        title: str,
        file_path: str,
        file_type: str,
        original_filename: str,
    ) -> Interview:
        interview = Interview(
            user_id=user.id,
            title=title.strip() or Path(original_filename).stem,
            file_path=file_path,
            file_type=file_type,
            original_filename=original_filename,
            status=InterviewStatus.pending,
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def update_interview(
        db: Session,
        user: User,
        interview_id: int,
        payload: InterviewUpdate,
    ) -> InterviewDetail:
        interview = InterviewService.get_interview(db, user, interview_id)
        if payload.title is not None:
            interview.title = payload.title.strip()
        db.commit()
        db.refresh(interview)
        return InterviewDetail.model_validate(interview)

    @staticmethod
    def soft_delete(db: Session, user: User, interview_id: int) -> None:
        interview = InterviewService.get_interview(db, user, interview_id)
        interview.deleted_at = datetime.now(timezone.utc)
        db.commit()

        file_path = Path(interview.file_path)
        if file_path.exists():
            file_path.unlink(missing_ok=True)

    @staticmethod
    def ensure_owner(interview: Interview, user: User) -> None:
        if interview.user_id != user.id:
            raise ForbiddenError()
