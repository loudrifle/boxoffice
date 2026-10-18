# boxoffice — Roadmap

_Last updated: 2026-10-17_

My path from frontend developer (React, Next.js, TypeScript) to backend engineer.
Every module pairs theory with practice and leaves verifiable evidence in this repo: code, tests, notes and documented decisions.

---

## The project

One application that grows module by module: **boxoffice, a ticketing platform for events**.
Organizers create events; customers book seats, pay and receive their ticket.

The domain was chosen because every topic shows up naturally, without forcing it:

| Topic                        | Where it shows up in the project                                               |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Transactions and concurrency | Two people book the last seat at the same instant: no overbooking allowed      |
| Idempotency                  | The client retries a payment request after a timeout: it must not charge twice |
| Queues and workers           | Confirmation emails and ticket PDFs are generated in the background            |
| Scheduled jobs               | Reservations not paid within 15 minutes are released                           |
| Caching                      | The event list is read thousands of times and rarely changes                   |
| Webhooks                     | The payment provider confirms the order asynchronously                         |
| Realtime                     | Seat availability updates while the user is looking at the page                |
| Authorization                | An organizer can only edit their own events                                    |
| Python / AI                  | Semantic search: "outdoor jazz concerts in Milan"                              |

---

## Repository layout

```
boxoffice/
├── README.md              # showcase: what it is, architecture, roadmap status
├── ROADMAP.md             # this file
├── docs/
│   ├── NN-topic.md        # theory notes, one per module, in my own words
│   ├── adr/               # Architecture Decision Records: every important choice and its reasoning
│   └── architecture.md    # diagram and description of the final architecture
├── apps/
│   ├── api/               # main API: Node + TypeScript + Express
│   ├── worker/            # background processing: BullMQ
│   └── py-service/        # Python service: FastAPI
├── labs/                  # isolated experiments to understand one concept, outside the project
├── docker-compose.yml
└── .github/workflows/
```

---

## Method: how each module works

1. **Theory** — explanation plus interview-style check questions.
2. **Lab** — a small experiment in `labs/` to see the concept first-hand (measure it, break it, compare).
3. **Project** — the feature that brings the concept into the real app, with tests.
4. **Notes** — `docs/NN-topic.md`: what I learned, in my own words, and the interview questions I can answer.
5. **Wrap-up** — branch `mNN-topic`, pull request with a description (what, why, how to verify), review, merge, tag `mNN`.

A module is done only when CI is green and I can answer its questions without looking at my notes.

---

## Stack

| Concern          | Choice                                      | Why                                                                                   |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Runtime          | Node.js LTS                                 | The same runtime Next.js runs on                                                      |
| Language         | TypeScript `strict`                         | Already familiar: the effort goes into concepts, not syntax                           |
| HTTP framework   | Express 5                                   | The one job postings ask for; being minimal, the architecture has to be built by hand |
| Validation       | Zod                                         | Runtime validation of incoming data, types derived from schemas                       |
| Database         | PostgreSQL                                  | The de facto standard for relational data                                             |
| Data access      | Drizzle + hand-written SQL where it matters | Stays close to SQL: you can see what reaches the database                             |
| Testing          | Vitest, Supertest, Testcontainers           | Integration tests against a real Postgres                                             |
| Cache and queues | Redis + BullMQ                              |                                                                                       |
| Containers       | Docker + Compose                            |                                                                                       |
| CI/CD            | GitHub Actions + GitHub Container Registry  |                                                                                       |
| Observability    | pino, OpenTelemetry, Prometheus, Grafana    |                                                                                       |
| Python           | uv, FastAPI, Pydantic, SQLAlchemy, pytest   |                                                                                       |
| Monorepo         | pnpm workspaces                             |                                                                                       |

---

## Overview

|     | Phase            | Module                                     | Est. effort |
| --- | ---------------- | ------------------------------------------ | ----------- |
| [x] | 0 · Setup        | M00 Setup and method                       | ~4h         |
| [ ] | 1 · Foundations  | M01 HTTP from first principles             | ~8h         |
| [ ] |                  | M02 The Node runtime                       | ~8h         |
| [ ] |                  | M03 Express and API architecture           | ~12h        |
| [ ] |                  | M04 REST API design                        | ~8h         |
| [ ] | 2 · Data         | M05 SQL and PostgreSQL                     | ~16h        |
| [ ] |                  | M06 Data access from Node                  | ~12h        |
| [ ] |                  | M07 Serious testing                        | ~8h         |
| [ ] |                  | M08 Transactions and concurrency ⭐        | ~12h        |
| [ ] |                  | M09 Database performance                   | ~8h         |
| [ ] | 3 · Security     | M10 Authentication                         | ~12h        |
| [ ] |                  | M11 Authorization and application security | ~8h         |
| [ ] | 4 · Production   | M12 Docker for real                        | ~8h         |
| [ ] |                  | M13 CI/CD                                  | ~12h        |
| [ ] |                  | M14 Caching                                | ~8h         |
| [ ] |                  | M15 Queues, workers and processes          | ~12h        |
| [ ] |                  | M16 External integrations and payments     | ~12h        |
| [ ] |                  | M17 Realtime _(optional)_                  | ~8h         |
| [ ] |                  | M18 Observability                          | ~12h        |
| [ ] | 5 · Python       | M19 Python for TypeScript developers       | ~12h        |
| [ ] |                  | M20 FastAPI and a second service           | ~20h        |
| [ ] | 6 · Architecture | M21 Scaling and system design              | ~12h        |

Total: roughly 230 hours. The repo is already worth showing at the end of phase 2 (~100h).

---

## Phase 0 · Setup

### M00 — Setup and method

- **Theory:** monorepos and workspaces; strict TypeScript on the server; ESM vs CommonJS; Node LTS releases; conventional commits.
- **Practice:** GitHub repo, pnpm workspace, base `tsconfig`, ESLint and Prettier, `.nvmrc`, README skeleton, pull request template, protected `main` branch.
- **Done when:** `pnpm lint` and `pnpm typecheck` run from the root; tag `m00`.

---

## Phase 1 · Foundations

### M01 — HTTP from first principles

- **Theory:** TCP and HTTP/1.1; anatomy of a request and a response; methods and their semantics (safe, idempotent); status codes; key headers; body and encoding; cookies; HTTP/2 and HTTP/3 at a high level.
- **Lab** `labs/01-raw-http`: a server built with `node:http` only. Hand-written routing, JSON body parsing, 404 and 405 responses, all exercised with `curl -v`. To finish: a list of what it would take to turn it into a framework.
- **Questions:** PUT vs PATCH? Why isn't POST idempotent? What happens between sending a URL and getting the response?

### M02 — The Node runtime

- **Theory:** the event loop and its phases; microtasks and macrotasks; libuv and the thread pool; non-blocking I/O; streams and backpressure; `worker_threads`; process signals; memory and garbage collection basics.
- **Lab** `labs/02-event-loop`: an endpoint that blocks the loop with heavy computation, measuring the latency of the other endpoints with autocannon; then the same computation moved to a worker thread.
- **Lab** `labs/02-streams`: serving a 1 GB file with `readFile` and with a stream, comparing memory usage.
- **Questions:** why is Node good at I/O and weaker at CPU-bound work? What is backpressure? `process.nextTick` vs `setImmediate`?

### M03 — Express and API architecture

- **Theory:** the middleware chain; routers; error handling (async in Express 5); layered architecture (route → controller → service → repository) and why it pays off; runtime validation vs TypeScript types; configuration from environment variables, validated at startup.
- **Project** `apps/api`: `/health` endpoint, event CRUD with in-memory data, centralized error handler, Zod validation, typed configuration. First tests with Vitest and Supertest.
- **ADR:** Express vs Fastify vs NestJS.
- **Questions:** why separate controllers from services? What happens to an error thrown inside an async handler?

### M04 — REST API design

- **Theory:** resources and URLs; correct status codes; error format (RFC 9457, Problem Details); offset vs cursor pagination; filtering and sorting; versioning; idempotency; OpenAPI.
- **Project:** complete API for events and venues; OpenAPI docs generated from the Zod schemas and browsable with Swagger UI.
- **Questions:** 401 or 403? 400 or 422? How do you change an API without breaking existing clients?

---

## Phase 2 · Data

### M05 — SQL and PostgreSQL

- **Theory:** the relational model; primary and foreign keys; constraints (`NOT NULL`, `UNIQUE`, `CHECK`); normalization and when to denormalize; `JOIN`, `GROUP BY`, subqueries, CTEs, window functions; Postgres types (`uuid`, `timestamptz`, `jsonb`, `numeric`).
- **Practice:** Postgres started with Docker Compose (first contact with Docker); working with `psql`.
- **Lab** `labs/05-sql`: SQL exercises on a sample dataset, with commented solutions.
- **Project:** schema for users, venues, events, ticket types, reservations and orders, with an ER diagram in `docs/`.
- **Questions:** why aren't prices stored as floats? `WHERE` vs `HAVING`? When does `jsonb` make sense?

### M06 — Data access from Node

- **Theory:** drivers and connection pools (why they exist, how to size them); ORM vs query builder vs raw SQL; migrations (and why the database is never changed by hand); seeding; the N+1 problem; the repository pattern.
- **Project:** Drizzle with migrations; a Postgres repository replacing the in-memory one (this is where the layers from M03 pay off); seed with realistic data.
- **Questions:** what is the N+1 problem and how do you spot it? What happens if the pool is too small? Too large?

### M07 — Serious testing

- **Theory:** the testing pyramid; unit, integration and end-to-end tests; what to mock and what not to; testing against a real database; isolation between tests; factories and fixtures; coverage and its limits.
- **Project:** Testcontainers for Postgres; integration tests for the endpoints; data factories; `pnpm test` working on a clean machine with no manual setup.
- **Questions:** why not mock the database in integration tests? How do you stop one test from polluting another's data?

### M08 — Transactions and concurrency ⭐

- **Theory:** ACID; isolation levels and anomalies (dirty read, non-repeatable read, phantom read, lost update); pessimistic locking (`SELECT … FOR UPDATE`); optimistic locking with a version column; database constraints as the last line of defense; deadlocks; idempotency keys.
- **Project:** seat booking. A test fires 200 concurrent requests at 50 seats: the first, naive version overbooks and the test proves it; then the fix. `Idempotency-Key` header on the booking endpoint.
- **Notes:** the bug, its cause and the fix documented step by step. This is the story to tell in interviews.
- **Questions:** pessimistic or optimistic locking, when? What is a lost update? How do you make a POST idempotent?

### M09 — Database performance

- **Theory:** how a B-tree index works; composite indexes and column order; partial indexes; `EXPLAIN ANALYZE`; sequential scan vs index scan; the write cost of indexes; why `OFFSET` gets slow on large tables.
- **Lab** `labs/09-indexes`: a table with millions of rows, queries measured before and after indexing, numbers reported in the lab's README.
- **Project:** indexes for the API's real queries; cursor pagination on the event list.
- **Questions:** why doesn't an index on `(a, b)` help a query filtering only on `b`? Why not index every column?

---

## Phase 3 · Security

### M10 — Authentication

- **Theory:** password hashing (argon2, salts, why not SHA); server-side sessions with cookies vs JWTs (access and refresh tokens, rotation, revocation); cookie attributes (`HttpOnly`, `Secure`, `SameSite`); CSRF; OAuth 2.0 and OpenID Connect.
- **Project:** sign-up, login, logout; sessions, with the choice explained in an ADR; GitHub login; password reset with expiring tokens.
- **Questions:** how do you revoke a JWT? Why shouldn't tokens live in `localStorage`? What does `SameSite` protect against?

### M11 — Authorization and application security

- **Theory:** authentication vs authorization; RBAC and ownership checks; OWASP Top 10 (broken access control, injection, SSRF…); CORS, what it protects and what it doesn't; security headers; rate limiting; secrets management; vulnerable dependencies.
- **Project:** organizer and customer roles; ownership checks on events; rate limiting on login; security headers; Dependabot; tests asserting that forbidden access is denied.
- **Questions:** does CORS protect the server? What is an IDOR and how do you prevent it?

---

## Phase 4 · Production

### M12 — Docker for real

- **Theory:** images vs containers; layers and build cache; multi-stage builds; minimal images and non-root users; `.dockerignore`; volumes and networks; healthchecks; twelve-factor app principles.
- **Project:** API Dockerfile; full Compose setup (API, Postgres, Redis) with healthchecks and dependencies; `docker compose up` starts everything. Image size measured before and after optimizing.
- **Questions:** why does instruction order in a Dockerfile matter? Why not run as root?

### M13 — CI/CD

- **Theory:** continuous integration, delivery and deployment; pipelines and jobs; dependency caching; environments and secrets; migrations during deploys; release strategies (rolling, blue/green); rollbacks.
- **Project:** GitHub Actions running lint, typecheck and tests (with Postgres) on every PR; image build and push to GHCR on every merge to `main`; automated deploy (a VPS with Compose, or Fly.io or Railway); README badge; merges blocked when CI fails.
- **Questions:** how do you ship a migration that breaks the previous version of the app? How do you roll back?

### M14 — Caching

- **Theory:** where caches live (browser, CDN, reverse proxy, application, database); HTTP caching (`Cache-Control`, `ETag`, 304); Redis; cache-aside and write-through; TTLs; invalidation; cache stampedes; what must never be cached.
- **Project:** `ETag` on the event list; Redis cache on event details, invalidated on update; benchmark before and after.
- **Questions:** how do you invalidate a cache when the data changes? What is a cache stampede and how do you prevent it?

### M15 — Queues, workers and processes

- **Theory:** why move work out of the request; queues and consumers; at-least-once delivery and therefore idempotent jobs; retries with backoff; dead letter queues; delayed and scheduled jobs; graceful shutdown; liveness vs readiness.
- **Project** `apps/worker`: BullMQ; confirmation email and ticket PDF in the background; scheduled job releasing expired reservations; API and worker shutting down cleanly on `SIGTERM`.
- **Questions:** what happens if the worker dies halfway through a job? Why must jobs be idempotent?

### M16 — External integrations and payments

- **Theory:** calling external services (timeouts, retries, circuit breakers); webhooks (signature verification, idempotency, no ordering guarantees); the outbox pattern to keep the database and the queue consistent.
- **Project:** Stripe payments in test mode; a webhook that confirms the order; handling duplicate webhooks. Optional: outbox.
- **Questions:** what if the webhook arrives before the response reaches the client? How do you avoid saving the order but losing the queue message?

### M17 — Realtime _(optional)_

- **Theory:** polling, long polling, Server-Sent Events, WebSockets; connection state; scaling across instances with Redis pub/sub.
- **Project:** live seat availability via SSE.
- **Questions:** SSE or WebSockets, when? How do you push an event to a client connected to a different instance?

### M18 — Observability

- **Theory:** structured logs and log levels; request and correlation IDs; metrics (rate, errors, duration); distributed tracing with OpenTelemetry; alerting and SLO basics.
- **Project:** pino logs with request IDs; `/metrics` endpoint for Prometheus; tracing from the API to the worker; Grafana in Compose with a dashboard.
- **Questions:** a user reports an error: how do you find it in the logs? Logs vs metrics vs traces?

---

## Phase 5 · Python

### M19 — Python for TypeScript developers

- **Theory:** environments and packages with uv; type hints and type checkers; dataclasses and Pydantic; `async`/`await` in Python vs JavaScript; the GIL and what it means for concurrency; pytest.
- **Lab** `labs/19-python`: the M02 labs redone in Python (event loop, CPU-bound work) and compared with Node.
- **Questions:** what happens if you call a blocking function inside an async endpoint? Threads, processes or asyncio, when?

### M20 — FastAPI and a second service

- **Theory:** ASGI and uvicorn; FastAPI dependency injection; Pydantic validation; sync vs async endpoints; SQLAlchemy 2; service-to-service communication (HTTP or queue); OpenAPI contracts.
- **Project** `apps/py-service`: semantic event search with embeddings and pgvector; the Node API calls it with a timeout and a fallback; Docker, CI and observability like the other services.
- **ADR:** Node vs Python, with benchmark numbers and when I would pick each.
- **Questions:** how do you handle the Python service not responding? Why does FastAPI generate its docs on its own?

---

## Phase 6 · Architecture

### M21 — Scaling and system design

- **Theory:** stateless services; horizontal scaling; load balancers; database connection limits; read replicas; the CAP theorem at a high level; where a system breaks under load.
- **Project:** three API instances behind a reverse proxy; load testing with k6; finding the bottleneck and documenting it; `docs/architecture.md` with the final diagram.
- **Wrap-up:** final README with architecture, decisions and measured numbers.
- **Questions:** what makes a service stateless? Traffic doubles tomorrow: what breaks first?
