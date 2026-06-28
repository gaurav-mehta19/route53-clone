# Architectural Decisions

A running log of non-obvious choices made while building the Route 53 clone. Each
entry: **decision · rationale · tradeoff**.

## Phase 1 — Scaffold + tooling

### 1. Cloudscape Design System as the primary UI kit

**Decision**: Build the UI on `@cloudscape-design/components` (the open-source
design system AWS publishes for the console).
**Rationale**: Highest-leverage path to "looks like Route 53." Re-implementing
AWS chrome with Tailwind would burn time on visual minutiae we get for free.
**Tradeoff**: Cloudscape components are client-only — every interactive page
needs a `'use client'` boundary, and the root layout has to import the global
stylesheets. Acceptable for an App-Router project where data fetching is
delegated to TanStack Query anyway.

### 2. Next.js 16 (Turbopack default) + React 19

**Decision**: Use the latest Next.js (16.2) which ships with Turbopack as the
default bundler.
**Rationale**: What `create-next-app` gives us. Keeps the door open to
React-19-only features (`use`, Actions) if useful.
**Tradeoff**: Cloudscape's published bundle is CommonJS in places; we'll
revisit if Turbopack surfaces an interop issue during Phase 5. Webpack
fallback is one CLI flag away (`next build --webpack`).

### 3. SQLite via SQLAlchemy 2.x, no Alembic

**Decision**: Bootstrap with `Base.metadata.create_all()` + a `seed.py` script.
**Rationale**: Scope is a demo console. Alembic adds friction without value
when there is only one schema iteration.
**Tradeoff**: Schema changes during development require dropping the DB. The
seed script makes that a one-liner.

### 4. Mock authentication

**Decision**: Issue an opaque random token from `/api/auth/login`, store
sessions server-side, validate with a `get_current_user` dependency. No JWT,
no refresh flow.
**Rationale**: The spec calls auth "mocked" — there's nothing real to defend.
A simple bearer-token flow is enough to exercise the protected-routes path.
**Tradeoff**: No token rotation, no session expiry sliding window.

### 5. ≤150 LOC per file as a design constraint

**Decision**: Treat the file-size budget as the enforcement mechanism for
layering, not a formatting nit.
**Rationale**: Caps that bite force extraction — repos/services/validators
stay narrow, components decompose into hooks + presentational pieces.
**Tradeoff**: Occasionally splits cohesive code into two files for budget
reasons. We err on the side of splitting cleanly along a real seam.
