# Repository Guidelines

## Project Structure & Module Organization

- `index.ts`: Server entry. Uses Hono Bun adapter `serve` and mounts the app.
- `src/index.ts`: Hono application (routes, middleware, handlers).
- `index.test.ts`: Unit tests using `bun:test`.
- `README.md`: Quick start and common commands.
- Add new modules under `src/` (e.g., `src/routes/translate.ts`).

## Build, Test, and Development Commands

- Install deps: `bun install`
- Dev server (HMR): `bun --hot ./index.ts` or `bun run dev`
- Tests: `bun test` (coverage: `bun test --coverage`)
- Optional bundle (when adding frontend/assets): `bun build <entry.ts|entry.html>`

## Coding Style & Naming Conventions

- Language: TypeScript, ESM modules.
- Indentation: 2 spaces; max line length ~100 chars.
- Naming: `camelCase` for vars/functions, `PascalCase` for types/classes, `kebab-case` for filenames.
- Exports: prefer named exports; default export for the Hono app is acceptable.
- Lint/format: If you use a formatter, match existing style; avoid unrelated reformat-only changes.

## Testing Guidelines

- Framework: `bun:test` with `import { test, expect } from "bun:test"`.
- Location: co-locate tests or place at repo root using `*.test.ts` (current: `index.test.ts`).
- Scope: cover route behavior and edge cases; use `app.request("/path")` for handlers.
- Run locally: `bun test` before pushing.

## Commit & Pull Request Guidelines

- Commits: concise, imperative subject (e.g., "add translate route"). Prefer Conventional Commits (`feat:`, `fix:`, `chore:`) when practical.
- PRs: include a clear summary, rationale, and testing notes. Link issues. Add screenshots for user-facing changes.
- Keep PRs focused; avoid mixed refactors and features.

## Security & Configuration Tips

- Environment: Bun auto-loads `.env`; avoid `dotenv`. Do not commit secrets.
- Server: defaults to port `3000`. Configure via env vars if needed.
- Dependencies: prefer Bun primitives (`Bun.file`, `bun:sqlite`) and Hono for routing; avoid adding heavy frameworks.
