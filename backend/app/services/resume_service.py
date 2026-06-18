from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeResponse


class ResumeService:
    @staticmethod
    def upload_resume(db: Session, user: User, file_path: str, filename: str) -> ResumeResponse:
        existing = db.query(Resume).filter(Resume.user_id == user.id).first()
        if existing:
            from pathlib import Path

            Path(existing.file_path).unlink(missing_ok=True)
            existing.file_path = file_path
            existing.filename = filename
            db.commit()
            db.refresh(existing)
            return ResumeResponse.model_validate(existing)

        resume = Resume(user_id=user.id, file_path=file_path, filename=filename)
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return ResumeResponse.model_validate(resume)

    @staticmethod
    def get_resume(db: Session, user: User) -> ResumeResponse:
        resume = db.query(Resume).filter(Resume.user_id == user.id).first()
        if not resume:
            raise AppError("No resume uploaded", status_code=404)
        return ResumeResponse.model_validate(resume)
