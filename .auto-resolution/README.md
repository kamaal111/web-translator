# Web Translator

Full‑stack monorepo for a web translation app built with Bun, Hono, Drizzle, and React. The repository contains a backend server (API + auth + docs) and a frontend web app (Vite + React + Radix UI), including end‑to‑end quality checks and Dockerized Postgres for local development.

## Tech Stack

- Server: Bun, Hono, Drizzle ORM, Better Auth
- Frontend: Vite, React, Radix UI Themes (custom CSS)
- Testing: `bun:test` (server), `vitest` (web)
- Tooling: `just` task runner, Prettier, ESLint (strict, no suppression)
- Database: Postgres (via Docker Compose)

## Monorepo Structure

```
server/        # Backend (Hono app, auth, DB, docs)
web/           # Frontend (Vite + React + Radix UI)
modules/       # Shared modules (e.g., schemas)
justfile       # Root task runner with common workflows
docker-compose.yml  # Local Postgres service
```

Key server files:

- `server/src/index.ts`: App entry; wires middleware, routes, and docs
- `server/src/auth/*`: Better Auth config, routes, middleware
- `server/src/projects/*`: Project routes, models, repos
- `server/src/docs/*`: OpenAPI generation and docs routes
- `server/src/db/*`: Drizzle schema and DB adapters

Key web files:

- `web/src/main.tsx`: Frontend entry
- `web/src/pages/*`: Pages (home, login)
- `web/src/auth/*`: Client + hooks + forms
- `web/src/openapi.yaml`: Generated API spec used to generate a typed API client

## Prerequisites

- Bun v1.3+ installed
- Docker and Docker Compose available (for Postgres)

## Quick Start

1. Prepare the workspace (installs dependencies for all packages and generates the web API client)

```bash
just prepare
```

2. Create `.env` (or use `.env.example`)

```bash
cp .env.example .env
# Ensure BETTER_AUTH_SECRET is a secure value:
# openssl rand -base64 32
```

3. Start development (server + web in parallel)

```bash
just dev
```

The server defaults to port `3000`.

## Environment Variables

Server (`server/src/env.ts`) reads:

- `DATABASE_URL` (required): e.g. `postgresql://wt_user:wt_password@localhost:5432/wt`
- `BETTER_AUTH_SECRET` (required): secure random secret
- `BETTER_AUTH_URL` (optional): defaults to `http://localhost:<PORT>`
- `PORT` (default: 3000), `DEBUG` (default: false), `LOG_LEVEL` (default: info)

See `.env.example` for a minimal setup.

## Common Tasks (just)

List all tasks:

```bash
just
```

Frequently used:

- `just dev` — run server and web in parallel with live reload
- `just start-services` — start Postgres via Docker Compose
- `just migrate` — run DB migrations (Drizzle)
- `just make-migrations` — generate DB migrations (Drizzle)
- `just ready` — full verification: format, lint, typecheck, tests, build
- `just test` — run tests (server + web)
- `just format` / `just format-check` — Prettier
- `just lint` — ESLint (strict, no suppressions)
- `just typecheck` — TS type checking (server, web, modules)

## Development Workflow

1. Start services (Postgres): `just start-services`
2. Generate/Apply DB migrations as needed: `just make-migrations`, `just migrate`
3. Run the stack: `just dev`
4. Update OpenAPI spec and regenerate client (happens as part of `just ready` and during web prepare):

```bash
just download-spec      # writes to web/src/openapi.yaml
# web prepare also runs client generation:
# just prepare-web (internal) → bunx openapi-generator-cli ...
```

API base path is `/app-api/v1`. Docs live under `/docs` (see below).

## API & Docs

The server exposes OpenAPI docs via `hono-openapi`:

- JSON spec: `/docs/spec.json`
- YAML spec: `/docs/spec.yaml`
- Swagger UI: `/docs/doc`
- Scalar UI: `/docs/scalar`

The `just download-spec` task generates `web/src/openapi.yaml` directly from the running app definition, and `web` uses that spec to generate a typed fetch client under `web/src/generated/api-client`.

## SPA Routing

Client‑side routes are served by the server’s SPA router. Update `server/src/web/router.ts` to add new paths that should return the HTML template.

- Patterns: use `:param` syntax for dynamic segments (e.g., `/projects/:id`).
- Login gating: each route can be marked `loginIsRequired` to force unauthenticated users to `/login`.
- Static files are served from `server/static`; `just build-for-server` writes the web build there.

Tests for SPA routing live in `server/src/web/__tests__/router.test.ts`. When adding routes, add/adjust tests to ensure HTML is served (200) and that API routes still return JSON.

### Notable Routes

- Health: `/health`
- App API base: `/app-api/v1`
  - Auth: sign-up, sign-in, sign-out, token, session, jwks
  - Projects: `POST /` (create project), `GET /:projectId/v/:versionId/strings` (strings)

See tests under `server/src/**/__tests__` for examples and expected behavior.

## Database & Migrations

Postgres runs via Docker Compose (`docker-compose.yml`). Default dev credentials:

- DB: `wt` — User: `wt_user` — Password: `wt_password` — Port: `5432`

Commands:

```bash
just start-services   # docker compose up -d
just make-migrations  # drizzle-kit generate
just migrate          # drizzle-kit migrate
```

Server tests create isolated test databases automatically and run migrations per test suite.

## Testing

- Server: `bun:test` with helper utilities (`server/src/__tests__/test-helper.ts`)
- Web: `vitest` with Testing Library; use `screen` queries (see `web/src/test-utils`)

Run all tests:

```bash
just test
```

Use `helper.signInAsDefaultUser()` for authenticated routes in server tests. See repo tests for patterns.

## Internationalization (Web)

All user‑facing text must be translatable.

- Define messages with `defineMessages` in `messages.ts` files co‑located with components.
- Message IDs are UPPERCASE with dot notation (e.g., `HOME.TITLE`).
- Use `useIntl` for dynamic/ARIA text and `FormattedMessage` for inline strings.
- Default locale and message catalog live under `web/src/translations`.

## Quality & CI

Follow strict lint rules (no ESLint disables, no `any`). Before merging or releasing:

```bash
just ready
```

This runs format, lint, typecheck, tests, and builds for both server and web, also ensuring the OpenAPI spec and generated client are up to date.

## Building & Docker

- Build web assets for server: `just build-for-server`
- Build server image: `just build-server`
- Run server container: `just run-server` (reads `DATABASE_URL`, `BETTER_AUTH_SECRET`)

## Troubleshooting

- Postgres not available: run `just start-services` and ensure Docker is running
- Env errors: verify `.env` matches `.env.example` and secrets are set
- OpenAPI/client out of date: run `just download-spec` then `just prepare-web` or `just ready`
- Tests failing due to DB: ensure `DATABASE_URL` points to local Postgres and is reachable

## License

MIT
