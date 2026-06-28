# Route 53 Clone

A high-fidelity clone of the AWS Route 53 console — FastAPI backend, Next.js +
Cloudscape frontend, SQLite persistence. DNS does not actually resolve; the
goal is a faithful recreation of the console's UX and workflows.

> **Status**: Phase 1 complete. See `DECISIONS.md` for a log of architectural
> choices. The full feature set lands phase by phase per the project plan.

## Run it locally

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Backend health check: <http://localhost:8000/api/health>
API docs (auto): <http://localhost:8000/docs>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: <http://localhost:3000>

## Repository layout

```
backend/   FastAPI + SQLAlchemy 2.x. Strict layering: router → service → repository → model.
frontend/  Next.js 16 (App Router) + Cloudscape + TanStack Query.
```

A full architecture overview, schema diagram, and API table land in Phase 10
when there's a real surface area to describe.
