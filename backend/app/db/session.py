from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record) -> None:
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    import app.models.interview  # noqa: F401
    import app.models.report  # noqa: F401
    import app.models.resume  # noqa: F401
    import app.models.user  # noqa: F401

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    (settings.upload_dir / "interviews").mkdir(parents=True, exist_ok=True)
    (settings.upload_dir / "resumes").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
