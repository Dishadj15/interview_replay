from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Interview Replay"
    debug: bool = False
    secret_key: str = "change-me-to-a-long-random-secret-key"
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"

    database_url: str = "sqlite:///./interview_replay.db"
    upload_dir: Path = Path("./uploads")
    max_upload_size_mb: int = 100

    openai_api_key: Optional[str] = None
    cors_origins: str = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "https://tracktalk-three.vercel.app"
)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
