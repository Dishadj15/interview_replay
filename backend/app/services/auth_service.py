from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.exceptions import AppError, NotFoundError
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse

settings = get_settings()


class AuthService:
    @staticmethod
    def signup(db: Session, payload: UserCreate) -> TokenResponse:
        existing = db.query(User).filter(User.email == payload.email.lower()).first()
        if existing:
            raise AppError("Email already registered", status_code=409)

        user = User(
            email=payload.email.lower(),
            hashed_password=get_password_hash(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(str(user.id))
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def login(db: Session, payload: UserLogin) -> TokenResponse:
        user = db.query(User).filter(User.email == payload.email.lower()).first()
        if not user or not verify_password(payload.password, user.hashed_password):
            raise AppError("Invalid email or password", status_code=401)

        token = create_access_token(str(user.id))
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def get_profile(user: User) -> UserResponse:
        return UserResponse.model_validate(user)
