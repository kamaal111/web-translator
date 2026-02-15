# web-translator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-01

## Active Technologies

- TypeScript (ESM), Bun 1.3+ (server), Vite + React 19 (web) + Hono, Drizzle ORM, React, TanStack Table, TanStack Virtual, TanStack Query, Radix UI Themes, react-intl (002-bulk-string-editor)
- PostgreSQL (existing `strings`, `translations`, `translation_snapshots` tables) (002-bulk-string-editor)

- TypeScript (ES2022+), Bun v1.3+ (server runtime), Node 20+ (web build) (001-string-version-editing)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (ES2022+), Bun v1.3+ (server runtime), Node 20+ (web build): Follow standard conventions

## Recent Changes

- 002-bulk-string-editor: Added TypeScript (ESM), Bun 1.3+ (server), Vite + React 19 (web) + Hono, Drizzle ORM, React, TanStack Table, TanStack Virtual, TanStack Query, Radix UI Themes, react-intl

- 001-string-version-editing: Added TypeScript (ES2022+), Bun v1.3+ (server runtime), Node 20+ (web build)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
