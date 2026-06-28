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

## Phase 2 — Backend core

### 6. Opaque server-side session tokens (no JWT)

**Decision**: `/api/auth/login` mints a random URL-safe 32-byte token,
persists a row in `user_sessions` with `expires_at`, and the
`get_current_user` dep validates by lookup.
**Rationale**: Simplest scheme that supports revocation and matches the
"mock auth" scope. Skipping JWT also dodges the whole key-rotation /
refresh-token surface.
**Tradeoff**: Every authenticated request does a DB read for the session
row. Acceptable at this scale; a hot-path cache would be the first
optimisation if it mattered.

### 7. `bcrypt` pinned `<4.0`

**Decision**: `passlib` 1.7.x bundles a "detect wrap bug" probe that
calls `bcrypt.hashpw` with a long test password; `bcrypt` 4.x rejects
that with `ValueError: password cannot be longer than 72 bytes`.
**Rationale**: Pinning is the lowest-friction fix vs. forking passlib or
rewriting the hashing layer.
**Tradeoff**: We sit on a non-latest bcrypt. Acceptable — bcrypt 3.x is
still actively maintained and the algorithm is unchanged.

### 8. Single error envelope for everything

**Decision**: One handler registered per of `AppError`, `HTTPException`,
`RequestValidationError`, and `Exception`. All produce
`{"error": {"code, message, details}}`.
**Rationale**: The frontend can have a single `ApiError` class and a
single error toast/inline-alert path. No `try` block has to know whether
it caught a domain error or a 422 — the shape is the same.
**Tradeoff**: A single un-handled exception still becomes a generic
"An unexpected error occurred" — we lose stack-trace fidelity in the
response (which is the point, but it shifts diagnosis to server logs).

## Phase 3 — Hosted zones backend

### 9. Composite unique `(created_by, name, type)` instead of `(name, type)`

**Decision**: A user can own only one PUBLIC `example.com.` zone, but
two different users can both own one.
**Rationale**: Mirrors how Route 53 treats accounts as the isolation
boundary. Lets the demo support multi-user expansion later without a
data migration.
**Tradeoff**: An accidental dup attempt produces a 409 from the service
layer (the friendlier path) but the DB constraint would also catch it.
Belt-and-suspenders is fine here.

### 10. Reusable `Page[T]` + `PageParams`

**Decision**: A single `schemas/pagination.py` ships the generic page
model and request params used by both zones and records list endpoints.
**Rationale**: Server-side pagination on every list view was a spec
requirement; making each resource re-invent the shape would have led to
subtle drift between the zones and records URLs.
**Tradeoff**: Sort field allowlists end up duplicated per resource (each
router defines its own `_SORT_ALLOW`). That's the right boundary — sort
keys are resource-specific.

## Phase 4 — Records backend

### 11. Validators split by concern (`ip`, `hostname`, `structured`, `registry`)

**Decision**: Four small files instead of one. A dispatch table
(`SPECS: dict[type, RecordTypeSpec]`) drives the service.
**Rationale**: Keeps each file under the LOC budget and makes adding a
new record type a one-line change in the registry plus a single function
elsewhere.
**Tradeoff**: Slightly more imports to wire when reading the code. Net
worth it — record-type rules now live next to other rules of the same
shape.

### 12. SOA bypasses the records service

**Decision**: `services/zone_bootstrap.create_default_records` writes
the apex NS + SOA via the **repository**, skipping the records service's
validator + dup check.
**Rationale**: SOA isn't in the validator registry (and shouldn't be —
users can't create one), and the values are server-controlled, so
running them through validation would either fail or require special
cases. Using the repo directly keeps the records service strict and the
boot path simple.
**Tradeoff**: Two write paths exist for `dns_records`. Acceptable — the
boot path lives in one short file, well-named.

### 13. `CreatableRecordType` ≠ `RecordType`

**Decision**: Two TypeScript and two Pydantic literals. SOA appears in
the read literal but not the create literal.
**Rationale**: Pydantic rejects POSTing an SOA at validation time, not
in the service. The frontend's create Select genuinely cannot offer SOA.
The TS compiler enforces the distinction at the form layer.
**Tradeoff**: A small amount of duplication in the literal definitions.

### 14. Records: 404 instead of 403 when a record is owned by someone else

**Decision**: `/api/records/{id}` returns 404 if the caller doesn't own
the parent zone.
**Rationale**: 403 would leak the existence of the record. 404 is the
existence-hiding convention.
**Tradeoff**: Slightly less helpful for a debugger; matches real AWS.

## Phase 5 — Frontend shell

### 15. Client-side auth gate, not Next middleware

**Decision**: `AppShell` reads the auth status from context and renders
a spinner / redirects to `/login` itself.
**Rationale**: App Router middleware can't read `localStorage`. A
cookie-based session would change that, but the spec scoped auth as
"mock" — pushing the gate into middleware would have been more code, not
less.
**Tradeoff**: Console pages flash a spinner on first paint before the
client knows the user is logged in. That's the right UX cue anyway.

### 16. Per-resource API modules on top of one `apiFetch`

**Decision**: `lib/api/client.ts` is the only `fetch` call site; every
resource (`auth.ts`, `hosted-zones.ts`, `dns-records.ts`, `stats.ts`)
sits on top with typed wrappers.
**Rationale**: One place to add auth headers, parse the error envelope
into a typed `ApiError`, normalise empty 204 responses. Adding a new
endpoint is 3-4 lines.
**Tradeoff**: Bumping the URL base or auth shape now requires touching
exactly one file — the upside.

## Phase 6 — Reusable UI kit

### 17. Parent owns DataTable state

**Decision**: `<DataTable<T>>` is dumb about pagination/sort/filter —
the page calling it holds the state and passes it back in as props.
**Rationale**: The hosted-zones and records pages need the table state
to derive the TanStack Query key. If DataTable owned the state, the
parent would have to read it back out, which is the wrong direction.
**Tradeoff**: A bit more wiring at the call site. The shared shape is
the same in both callers, so duplication is bounded.

### 18. `queueMicrotask` for in-effect state resets

**Decision**: The new React 19 / ESLint rule
`react-hooks/set-state-in-effect` fires on legitimate one-shot resets
(e.g. clearing the typed-confirm input when a delete modal opens).
Wrapping `setState` in `queueMicrotask` defers it past the synchronous
effect body and satisfies the rule.
**Rationale**: Simplest fix that doesn't reshape the control flow or
remount the component.
**Tradeoff**: A microtask is a tiny side-channel future readers have to
recognise. Comment lives in the code.

## Phase 7 — Hosted zones UI

### 19. Optimistic delete with snapshot rollback

**Decision**: Both `useDeleteHostedZone` and `useDeleteRecord` remove
the row from every cached list page in `onMutate` and restore the
previous data in `onError`.
**Rationale**: A delete is a one-RT round-trip that almost always
succeeds; making the row hang around with a spinner is the worse UX.
**Tradeoff**: A failure shows the row reappear plus a toast — slightly
more visible than a non-optimistic flow. The trade reads correctly:
"oh, that didn't actually delete".

### 20. Page-local table state, not URL-sync

**Decision**: Pagination/sort/filter live in `useState`; the URL only
carries the route + resource id.
**Rationale**: Shareable URLs aren't on the spec, and URL-syncing every
table param would have pushed both table orchestrator files past the
150-LOC budget.
**Tradeoff**: Refreshing the page returns to page 1 with no filter.
`nuqs` would be a clean Phase 10+ add-on.

## Phase 8 — Records UI

### 21. Shared `ValueField` between create and edit

**Decision**: One component reads `TYPE_HELP[type]` and renders an
`Input` or `Textarea` based on whether the type stores multi-line
values.
**Rationale**: Stops the create modal from hitting the 150-LOC budget
and means per-type tweaks (e.g. a structured MX editor later) only
change one file.
**Tradeoff**: A small indirection between modal and field. Worth it.

### 22. Edit only PATCHes fields that actually changed

**Decision**: The records edit modal snapshots the initial TTL + value
and only sends fields the user touched.
**Rationale**: Lets a user bump the TTL on an auto-managed SOA record
without re-running the value through the validator registry (which
would reject "SOA" as an unsupported type).
**Tradeoff**: A no-op submit just dismisses without a network call —
arguably the right behaviour.

### 23. Tiny `BreadcrumbProvider` for friendly dynamic labels

**Decision**: Records page calls `useRegisterBreadcrumb(zoneId, zone.name)`
once the zone loads, and the global `AppBreadcrumbs` reads the override.
**Rationale**: The auto-derived breadcrumb showed the raw `Z…` id. A
context override is ~50 LOC and applies to any future dynamic segment.
**Tradeoff**: Pages now have a small mount-time side effect. The hook
encapsulates it and cleans up on unmount.

## Phase 9 — Mocked sections

### 24. Coming-Soon pages get real Route 53 copy, not "TODO"

**Decision**: Each of the four mocked sections ships a one-paragraph
description of what AWS Route 53 actually does in that area plus a
"What this would do" capability list.
**Rationale**: Reviewers can see at a glance that the IA is intentional
and the scope is "implement the records slice end-to-end" rather than
"forgot to build these".
**Tradeoff**: The pages look more polished than they are. The Alert at
the top makes the "not wired up" status unambiguous.

## Phase 10 — Polish + docs

### 25. `/api/stats` endpoint instead of client-side aggregation

**Decision**: Added a dedicated `GET /api/stats` service backed by a
single `SUM` query.
**Rationale**: Phase 9 fetched the first 200 zones and summed
client-side, which is correct up to 200 zones and quietly wrong above.
A `/stats` endpoint is the right shape and is 40 LOC.
**Tradeoff**: One more route + invalidation key in the frontend. Both
mutation files invalidate `statsKeys.all` so the tiles refresh after
any zone/record change.

### 26. Cloudscape-native dark mode via `applyMode`

**Decision**: `ThemeProvider` reads `localStorage`, calls
`@cloudscape-design/global-styles` `applyMode(Mode.Dark | Mode.Light)`,
and the top-nav exposes a toggle button.
**Rationale**: Cloudscape's design tokens already support dark mode
end-to-end; this is the cheapest possible "looks polished" win.
**Tradeoff**: First paint is always light theme; a microtask after mount
flips it. A flash for sub-100ms — acceptable for a demo.

### 27. Compact + striped DataTable

**Decision**: One prop pair on the underlying Cloudscape Table:
`contentDensity="compact"` + `stripedRows`.
**Rationale**: Matches Route 53's dense table style. Two-line change.
**Tradeoff**: Less padding than the Cloudscape default — intentional;
fits more records on screen.
