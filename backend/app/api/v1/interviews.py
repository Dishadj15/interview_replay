from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, get_db
from app.dependencies import get_current_user
from app.models.interview import InterviewStatus
from app.models.user import User
from app.schemas.interview import (
    InterviewCreateResponse,
    InterviewDetail,
    InterviewListResponse,
    InterviewUpdate,
    ProcessingStatusResponse,
)
from app.services.interview_service import InterviewService
from app.services.progress_service import InterviewProcessingRunner
from app.services.upload_service import UploadService

router = APIRouter(prefix="/interviews", tags=["interviews"])


def _run_processing(interview_id: int) -> None:
    db = SessionLocal()
    try:
        InterviewProcessingRunner.run(db, interview_id)
    finally:
        db.close()


@router.get("", response_model=InterviewListResponse)
def list_interviews(
    status: InterviewStatus | None = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewListResponse:
    return InterviewService.list_interviews(
        db,
        current_user,
        status=status,
        limit=min(limit, 100),
        offset=max(offset, 0),
    )


@router.post("", response_model=InterviewCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    background_tasks: BackgroundTasks,
    title: str = Form(default=""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewCreateResponse:
    file_path, file_type, original_filename = await UploadService.save_interview_file(file)
    interview = InterviewService.create_interview(
        db,
        current_user,
        title=title,
        file_path=file_path,
        file_type=file_type,
        original_filename=original_filename,
    )
    background_tasks.add_task(_run_processing, interview.id)
    return InterviewCreateResponse.model_validate(interview)


@router.get("/{interview_id}", response_model=InterviewDetail)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewDetail:
    interview = InterviewService.get_interview(db, current_user, interview_id)
    return InterviewDetail.model_validate(interview)


@router.patch("/{interview_id}", response_model=InterviewDetail)
def update_interview(
    interview_id: int,
    payload: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewDetail:
    return InterviewService.update_interview(db, current_user, interview_id, payload)


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    InterviewService.soft_delete(db, current_user, interview_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{interview_id}/process", response_model=ProcessingStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def process_interview(
    interview_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProcessingStatusResponse:
    interview = InterviewService.get_interview(db, current_user, interview_id)
    if interview.status == InterviewStatus.processing:
        return ProcessingStatusResponse(
            status=interview.status,
            progress_pct=interview.progress_pct,
            eta_seconds=60,
        )

    background_tasks.add_task(_run_processing, interview.id)
    interview.status = InterviewStatus.pending
    interview.progress_pct = 0
    db.commit()
    db.refresh(interview)

    return ProcessingStatusResponse(
        status=InterviewStatus.processing,
        progress_pct=0,
        eta_seconds=90,
    )


@router.get("/{interview_id}/status", response_model=ProcessingStatusResponse)
def get_processing_status(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProcessingStatusResponse:
    interview = InterviewService.get_interview(db, current_user, interview_id)
    eta_seconds = None
    if interview.status == InterviewStatus.processing:
        remaining = max(0, 100 - interview.progress_pct)
        eta_seconds = max(10, int(remaining * 0.9))

    return ProcessingStatusResponse(
        status=interview.status,
        progress_pct=interview.progress_pct,
        eta_seconds=eta_seconds,
        error_message=interview.error_message,
    )
