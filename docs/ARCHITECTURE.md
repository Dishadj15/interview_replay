

## **1\. System ArchitectureThe architecture separates concerns into five layers. The client never touches the database directly — all requests flow through the FastAPI backend with JWT validation at the middleware level. The most important architectural decision here is the async processing pipeline: transcription and analysis are long-running operations (30–120 seconds), so they must be decoupled from the HTTP request/response cycle entirely. A user uploads a file, gets a `202 Accepted` with a job ID, and polls or receives a webhook when processing completes.**

---

## **2\. Database Schema**

The schema is designed around a core `interviews` table with a one-to-many relationship to `analytics_results`, keeping raw results granular and separating concerns between identity, content, and analysis.Key schema decisions worth explaining:

`interviews.status` is an enum (`pending`, `processing`, `completed`, `failed`) — this drives UI state and prevents orphaned jobs. `analytics_results.filler_word_breakdown` is a JSONB column (e.g. `{"um": 12, "uh": 7, "like": 4}`) because the set of filler words can vary and doesn't justify its own normalized table at MVP scale. `transcripts.word_timestamps` stores the full word-level timing array as JSONB — this powers the interactive timeline. `processing_jobs` is a dedicated audit table; do not use `interviews` itself to track job state, because one interview may eventually spawn multiple job types (re-transcription, enhanced analysis).

**Indexes to add from day one**: `interviews(user_id, created_at DESC)` for the dashboard list query; `processing_jobs(interview_id, status)` for job polling; `analytics_results(interview_id)` for the analytics fetch.

---

## **3\. API Endpoints**

The API follows REST conventions with a clean resource hierarchy. All routes are prefixed `/api/v1`.

**Auth**

* `POST /auth/refresh` — exchange Supabase refresh token, return new JWT  
* `GET /auth/me` — return current user profile from the JWT claim

**Interviews**

* `GET /interviews` — paginated list for the current user, supports `?status=completed&limit=20&cursor=`  
* `POST /interviews` — create an interview record, returns a Supabase signed upload URL and the interview ID  
* `GET /interviews/{id}` — full interview detail including status  
* `DELETE /interviews/{id}` — soft delete (sets `deleted_at`, Supabase Storage file is removed async)  
* `PATCH /interviews/{id}` — update title or recorded\_at

**Processing**

* `POST /interviews/{id}/process` — enqueue the processing pipeline; idempotent, safe to retry  
* `GET /interviews/{id}/status` — lightweight job status poll (`{status, progress_pct, eta_seconds}`)

**Analytics**

* `GET /interviews/{id}/transcript` — full transcript with word timestamps  
* `GET /interviews/{id}/analytics` — complete analytics result  
* `GET /interviews/{id}/timeline` — timeline events array only (lighter payload for the timeline component)

**Progress**

* `GET /users/me/progress` — aggregate stats across all completed interviews (avg WPM trend, filler rate trend, score history) — this is a single optimized query, not computed on the fly from raw results

**Webhooks (internal)**

* `POST /internal/jobs/complete` — called by the Celery worker when a job finishes; validates an HMAC secret, updates the database, optionally triggers a push notification

---

## **4\. Backend Folder Structure**

backend/  
├── app/  
│   ├── main.py                  \# FastAPI app factory, middleware registration  
│   ├── config.py                \# Settings via pydantic-settings (env vars)  
│   ├── dependencies.py          \# Shared FastAPI Depends: get\_db, get\_current\_user  
│   │  
│   ├── api/  
│   │   └── v1/  
│   │       ├── router.py        \# Aggregates all v1 routers  
│   │       ├── auth.py  
│   │       ├── interviews.py  
│   │       ├── analytics.py  
│   │       ├── processing.py  
│   │       └── users.py  
│   │  
│   ├── core/  
│   │   ├── security.py          \# JWT decode/verify against Supabase JWKS  
│   │   ├── supabase.py          \# Supabase client singleton (storage \+ auth admin)  
│   │   └── exceptions.py        \# Custom exception classes \+ handlers  
│   │  
│   ├── models/  
│   │   ├── interview.py         \# SQLAlchemy ORM models  
│   │   ├── transcript.py  
│   │   ├── analytics.py  
│   │   ├── processing\_job.py  
│   │   └── user.py  
│   │  
│   ├── schemas/  
│   │   ├── interview.py         \# Pydantic request/response schemas  
│   │   ├── transcript.py  
│   │   ├── analytics.py  
│   │   └── user.py  
│   │  
│   ├── services/  
│   │   ├── interview\_service.py  \# Business logic: create, list, delete  
│   │   ├── upload\_service.py     \# Generate signed URLs, validate file type/size  
│   │   ├── analytics\_service.py  \# Read \+ aggregate analytics queries  
│   │   └── progress\_service.py   \# Cross-interview trend computation  
│   │  
│   ├── workers/  
│   │   ├── celery\_app.py         \# Celery factory, broker config  
│   │   ├── tasks/  
│   │   │   ├── transcription.py  \# Whisper API call, store result  
│   │   │   ├── nlp\_analysis.py   \# Filler detection, pace, pauses  
│   │   │   └── scoring.py        \# Compute overall\_score, write analytics\_results  
│   │   └── pipeline.py           \# Orchestrates task chain: transcription → nlp → scoring  
│   │  
│   └── db/  
│       ├── session.py            \# SQLAlchemy async session factory  
│       └── migrations/           \# Alembic migration files  
│  
├── tests/  
│   ├── conftest.py               \# Fixtures: test DB, mock Supabase, auth bypass  
│   ├── api/                      \# Route-level integration tests  
│   └── workers/                  \# Task-level unit tests with mocked external calls  
│  
├── Dockerfile  
├── railway.toml                   \# Railway deploy config (web \+ worker process)  
├── requirements.txt  
└── .env.example

The key principle here: **services contain business logic, routers contain only HTTP glue**. A route handler should be no more than 10–15 lines — validate input, call a service, return a schema. This makes business logic independently testable without spinning up an HTTP server.

The `workers/pipeline.py` file is important — it defines the Celery task chain (`transcription | nlp_analysis | scoring`) as a single composable unit. Railway lets you run two process types from one repo (web server \+ Celery worker), configured via `railway.toml`.

---

## **5\. Frontend Folder Structure**

frontend/  
├── src/  
│   ├── main.tsx                    \# React root, providers  
│   ├── App.tsx                     \# Router setup  
│   │  
│   ├── pages/  
│   │   ├── Login.tsx  
│   │   ├── Dashboard.tsx           \# Interview list \+ upload CTA  
│   │   ├── InterviewDetail.tsx     \# Full analytics view  
│   │   ├── Progress.tsx            \# Cross-interview trends  
│   │   └── Upload.tsx              \# Upload flow (if broken out)  
│   │  
│   ├── components/  
│   │   ├── layout/  
│   │   │   ├── AppShell.tsx        \# Sidebar \+ header wrapper  
│   │   │   ├── Sidebar.tsx  
│   │   │   └── TopBar.tsx  
│   │   │  
│   │   ├── interview/  
│   │   │   ├── InterviewCard.tsx   \# Card in the dashboard list  
│   │   │   ├── StatusBadge.tsx     \# Pending/processing/completed/failed  
│   │   │   ├── UploadDropzone.tsx  \# Drag-drop \+ file picker  
│   │   │   └── ProcessingPoller.tsx \# Polls /status, updates UI live  
│   │   │  
│   │   ├── analytics/  
│   │   │   ├── TranscriptViewer.tsx  \# Scrollable text with word highlights  
│   │   │   ├── FillerWordChart.tsx   \# Bar chart: breakdown by word  
│   │   │   ├── PaceIndicator.tsx     \# WPM gauge with ideal range  
│   │   │   ├── PauseList.tsx         \# Timestamped pause list  
│   │   │   └── InterviewTimeline.tsx \# Visual event timeline  
│   │   │  
│   │   ├── progress/  
│   │   │   ├── ScoreTrendChart.tsx   \# Line chart across interviews  
│   │   │   ├── FillerRateTrend.tsx  
│   │   │   └── PaceTrend.tsx  
│   │   │  
│   │   └── ui/                      \# Generic primitives (Button, Card, Modal, etc.)  
│   │  
│   ├── hooks/  
│   │   ├── useAuth.ts               \# Supabase session, user object  
│   │   ├── useInterview.ts          \# Fetch \+ cache single interview  
│   │   ├── useInterviews.ts         \# Paginated list with infinite scroll  
│   │   ├── useAnalytics.ts          \# Fetch analytics for an interview  
│   │   ├── useProgress.ts           \# Fetch cross-interview progress  
│   │   └── useProcessingStatus.ts   \# Polling hook with backoff  
│   │  
│   ├── api/  
│   │   ├── client.ts                \# Axios instance: base URL, JWT header injection  
│   │   ├── interviews.ts            \# API functions: createInterview, listInterviews…  
│   │   ├── analytics.ts  
│   │   └── users.ts  
│   │  
│   ├── store/  
│   │   └── authStore.ts             \# Zustand slice: user, session, logout  
│   │  
│   ├── types/  
│   │   ├── interview.ts             \# Interview, ProcessingStatus enums  
│   │   ├── analytics.ts             \# AnalyticsResult, FillerBreakdown, TimelineEvent  
│   │   └── user.ts  
│   │  
│   └── utils/  
│       ├── formatDuration.ts        \# "1h 23m" from seconds  
│       ├── formatWPM.ts             \# Annotate with slow/ideal/fast  
│       └── timelineHelpers.ts       \# Transform API response to timeline format  
│  
├── public/  
├── index.html  
├── vite.config.ts  
├── tailwind.config.ts  
├── tsconfig.json  
└── vercel.json                      \# Rewrites for SPA routing

The `api/` layer is kept separate from hooks intentionally. Hooks own the React Query logic (caching, loading/error state, refetching). The `api/` layer is pure async functions with no React in them — this makes them independently testable and reusable outside of components. The `useProcessingStatus` hook implements exponential backoff: poll every 2s → 4s → 8s → 15s → 30s, capped at 30s, and stops when status is `completed` or `failed`.

---

## **6\. MVP Roadmap**

**Phase 1 — Foundation (weeks 1–3)**

Stand up the full infrastructure before writing any feature code. Supabase project created, PostgreSQL schema migrated with Alembic, FastAPI deployed to Railway with health check passing, Vercel frontend deployed with a working auth flow (login, logout, JWT stored, route guards in place). No file processing yet — just a user can sign in and see an empty dashboard. This phase is unglamorous but eliminates infrastructure surprises before business logic is built.

**Phase 2 — Upload pipeline (weeks 4–5)**

Implement the upload flow end-to-end: `POST /interviews` generates a signed Supabase Storage URL, the frontend uploads directly to Storage (bypassing the backend entirely — critical for performance), then calls `POST /interviews/{id}/process` to enqueue. Celery worker calls the Whisper API, stores the transcript. At this point users can upload a file and get a raw transcript back. No analytics yet.

**Phase 3 — Core analytics (weeks 6–8)**

Add the NLP analysis worker: filler word detection via regex \+ a small wordlist, speaking pace calculation from word timestamps, pause detection by finding gaps in the word timeline. Build the `analytics_results` write path and the `GET /interviews/{id}/analytics` read path. Build the four main frontend analytics components: transcript viewer, filler word chart, pace indicator, pause list.

**Phase 4 — Timeline \+ progress tracking (weeks 9–10)**

Build the `InterviewTimeline` component from `timeline_events` (which the scoring worker populates as JSONB). Implement the `GET /users/me/progress` endpoint with the trend queries. Build the progress charts frontend. At this point the product is feature-complete for MVP launch.

**Phase 5 — Hardening (weeks 11–12)**

Error handling for failed jobs (retry logic, user-facing error messages), file type/size validation, rate limiting on the processing endpoint, end-to-end tests for the upload-to-analytics flow, Sentry integration, and a post-processing email notification.

---

## **7\. Future Scaling Considerations**

**Processing throughput.** The Whisper API call is the primary bottleneck. When volume grows, evaluate self-hosting Whisper on a GPU instance (Railway supports GPU workers). Implement a priority queue so paying users get faster processing. Add a `max_concurrent_workers` limit per user tier.

**Storage costs.** Raw audio files are large. Implement a retention policy: move processed files to cold storage (Supabase supports S3-compatible backends) after 90 days, delete them after user-defined retention periods. Consider storing only audio, not video, once the user is processed.

**Database.** The JSONB columns in `analytics_results` and `transcripts` will become query targets eventually (e.g. "find all interviews where 'um' count \> 10"). At that point, normalize `filler_word_breakdown` into a `filler_word_counts` table. Add a read replica once you have a meaningful read/write ratio (analytics reads are expensive, writes are infrequent).

**Real-time updates.** Replace polling for job status with Supabase Realtime subscriptions — the backend worker updates the `interviews.status` column and the frontend receives a push via the Supabase WebSocket channel. This removes all polling load from the API.

**Multi-tenancy / teams.** If teams need to share interviews, introduce an `organizations` table with an `organization_id` foreign key on `users` and `interviews`, and update Supabase RLS policies to scope access by org. Design for this now by keeping `user_id` on all tables rather than relying on session context.

**Search.** As transcript volume grows, add full-text search. PostgreSQL's `tsvector` on `transcripts.full_text` handles this well to \~500k rows. Beyond that, move to a dedicated search service (Meilisearch on Railway or Typesense).

**Observability stack.** Add structured logging (JSON to Railway's log drain), Sentry for error tracking, and a metrics layer (Prometheus \+ Grafana, or Datadog) once you're past MVP. The key metrics to track: job queue depth, p95 processing latency per job type, and upload success rate.

