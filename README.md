# Interview Replay

Interview Replay is an MVP web application for uploading mock interview recordings and receiving communication analytics: transcription, filler word detection, speaking pace, pause analysis, and AI coaching feedback.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Tailwind CSS, React Router, Zustand |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Auth | JWT (email + password) |
| Storage | Local filesystem (`backend/uploads/`) |
| Processing | FastAPI background tasks (no Celery/Redis) |

## Features

- User signup, login, logout
- Dashboard with uploaded interviews
- Upload interview recordings (mp3, wav, m4a, mp4, webm, mov)
- Upload resume PDF
- Automatic transcription and analytics processing
- Analytics page (filler words, pace, pauses, timeline, transcript)
- AI feedback page
- Interview history page
- Progress analytics across completed interviews
- Responsive UI (desktop sidebar + mobile bottom nav)

## Project structure

```
Interview-Replay/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST routes
│   │   ├── core/            # Security, exceptions
│   │   ├── db/              # SQLAlchemy session
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # UI + feature components
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   └── package.json
└── docs/
```

## Prerequisites

- Python 3.9+
- Node.js 20+
- ffmpeg (required by `pydub` for audio/video processing)

Install ffmpeg:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:

- Set `SECRET_KEY` to a long random string
- Optionally set `OPENAI_API_KEY` for Whisper transcription and enhanced AI feedback

Start the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check: `http://127.0.0.1:8000/health`

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App URL: `http://127.0.0.1:5173`

The Vite dev server proxies `/api` and `/uploads` to the backend.

## API overview

All routes are prefixed with `/api/v1`.

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

### Interviews

- `GET /interviews`
- `POST /interviews` (multipart: `title`, `file`)
- `GET /interviews/{id}`
- `PATCH /interviews/{id}`
- `DELETE /interviews/{id}`
- `POST /interviews/{id}/process`
- `GET /interviews/{id}/status`

### Analytics

- `GET /interviews/{id}/analytics`
- `GET /interviews/{id}/transcript`
- `GET /interviews/{id}/timeline`

### User

- `GET /users/me/progress`
- `POST /resumes` (multipart PDF)
- `GET /resumes`

## Database schema

- **users**: `id`, `email`, `hashed_password`, `created_at`
- **interviews**: `id`, `user_id`, `title`, `file_path`, `file_type`, `original_filename`, `transcript`, `status`, `duration_seconds`, `progress_pct`, `error_message`, `created_at`, `deleted_at`
- **reports**: `id`, `interview_id`, `filler_count`, `filler_word_breakdown`, `speaking_rate`, `pause_count`, `pauses`, `word_timestamps`, `feedback`, `overall_score`
- **resumes**: `id`, `user_id`, `file_path`, `filename`, `uploaded_at`

## Processing pipeline

1. User uploads a recording via `POST /interviews`
2. File is stored locally under `backend/uploads/interviews/`
3. A background task transcribes and analyzes the audio
4. Interview status moves through `pending → processing → completed` (or `failed`)
5. Frontend polls `GET /interviews/{id}/status` until complete

Without `OPENAI_API_KEY`, audio metrics (duration, pauses) still run, but transcription uses a fallback message. Set the key for full Whisper transcription and GPT-enhanced feedback.

## Development notes

- SQLite database file: `backend/interview_replay.db` (created on first run)
- Uploaded files: `backend/uploads/`
- JWT tokens are stored in `localStorage` on the frontend
- MVP intentionally avoids Celery, Redis, webhooks, and microservices

## Production build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Serve the frontend `dist/` folder with any static host and point `VITE_API_BASE_URL` to your backend URL.
