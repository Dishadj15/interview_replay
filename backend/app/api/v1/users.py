from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.resume import ResumeResponse, UserProgressResponse
from app.services.progress_service import ProgressService
from app.services.resume_service import ResumeService
from app.services.upload_service import UploadService

router = APIRouter(tags=["users"])


@router.get("/users/me/progress", response_model=UserProgressResponse)
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserProgressResponse:
    return ProgressService.get_user_progress(db, current_user)


@router.post("/resumes", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    file_path, filename = await UploadService.save_resume_file(file)
    return ResumeService.upload_resume(db, current_user, file_path, filename)


@router.get("/resumes", response_model=ResumeResponse)
def get_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    return ResumeService.get_resume(db, current_user)
