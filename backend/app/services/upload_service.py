from __future__ import annotations

import mimetypes
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config import get_settings
from app.core.exceptions import AppError

settings = get_settings()

ALLOWED_INTERVIEW_EXTENSIONS = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
}

ALLOWED_RESUME_EXTENSIONS = {".pdf": "application/pdf"}


class UploadService:
    @staticmethod
    def _validate_extension(filename: str, allowed: dict[str, str]) -> str:
        suffix = Path(filename).suffix.lower()
        if suffix not in allowed:
            allowed_list = ", ".join(sorted(allowed.keys()))
            raise AppError(f"Unsupported file type. Allowed: {allowed_list}")
        return suffix

    @staticmethod
    async def save_interview_file(file: UploadFile) -> tuple[str, str, str]:
        if not file.filename:
            raise AppError("Filename is required")

        suffix = UploadService._validate_extension(file.filename, ALLOWED_INTERVIEW_EXTENSIONS)
        content_type = file.content_type or allowed_mime(suffix)
        stored_name = f"{uuid.uuid4().hex}{suffix}"
        destination = settings.upload_dir / "interviews" / stored_name

        size = 0
        async with aiofiles.open(destination, "wb") as out_file:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.max_upload_size_bytes:
                    destination.unlink(missing_ok=True)
                    raise AppError(
                        f"File exceeds maximum size of {settings.max_upload_size_mb} MB"
                    )
                await out_file.write(chunk)

        return str(destination), content_type, file.filename

    @staticmethod
    async def save_resume_file(file: UploadFile) -> tuple[str, str]:
        if not file.filename:
            raise AppError("Filename is required")

        suffix = UploadService._validate_extension(file.filename, ALLOWED_RESUME_EXTENSIONS)
        stored_name = f"{uuid.uuid4().hex}{suffix}"
        destination = settings.upload_dir / "resumes" / stored_name

        size = 0
        async with aiofiles.open(destination, "wb") as out_file:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.max_upload_size_bytes:
                    destination.unlink(missing_ok=True)
                    raise AppError(
                        f"File exceeds maximum size of {settings.max_upload_size_mb} MB"
                    )
                await out_file.write(chunk)

        return str(destination), file.filename


def allowed_mime(suffix: str) -> str:
    return ALLOWED_INTERVIEW_EXTENSIONS.get(suffix, mimetypes.guess_type(f"file{suffix}")[0] or "application/octet-stream")
