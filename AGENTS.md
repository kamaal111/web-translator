# Repository Guidelines

## Critical Development Rules

- **ALWAYS verify your work with relevant commands BEFORE claiming completion**
  - For linting changes: run `just lint` to verify
  - For type changes: run `just typecheck` to verify
  - For tests: run `just test` to verify
  - For formatting: run `just format` to verify
  - **ALWAYS run `just ready` as the FINAL verification before finishing ANY task**
- **NEVER claim a task is done until ALL checks from `just ready` pass** (format, lint, typecheck, tests, build)
  - **ALWAYS run `just ready` from the root directory before finishing any task**
  - **If `just ready` fails, you MUST fix all errors before saying you're done**
  - This is NON-NEGOTIABLE - no exceptions
- **NEVER add ESLint suppression comments** (e.g., `eslint-disable`, `eslint-disable-next-line`) - ALWAYS fix the underlying issue instead
  - Restructure code, separate concerns, fix types, or refactor - but NEVER suppress warnings
  - ESLint rules exist for good reasons - respect them and fix the root cause
  - This is NON-NEGOTIABLE - no exceptions
- **NEVER disable or turn off ESLint rules** - if a rule is failing, fix the code to comply with it
  - Do not modify ESLint configuration to suppress errors
  - Fix the underlying code issue instead
- **NEVER use the `any` type in TypeScript** - always use proper types, `unknown`, or generics
  - This is enforced by ESLint rules and will cause lint failures
  - Use `unknown` when the type is truly unknown, then narrow it with type guards
  - Use proper generics and type constraints instead of escaping the type system
- **NEVER run dev servers yourself** (e.g., `bun run dev`, `just dev-server`) - they run in background and are difficult to kill
- **NEVER perform destructive git operations** (e.g., `git checkout`, `git stash`, `git reset`, `git rebase`) - these change the working directory state
- **ALWAYS use justfile commands** when available for debugging and development tasks (check `just` to list available commands)
- **When making breaking changes to interfaces/types, find and update ALL usages including tests**
- **ALWAYS add helpful error logs** for debugging purposes using `getLogger(c).error()` (server) or appropriate logging mechanism
  - Log internal errors with detailed context before throwing exceptions
  - Use structured logging: pass additional context as second parameter (e.g., `getLogger(c).error('message', { userId, requestData })`)
  - NEVER leak internal error details to API responses - use generic error messages for exceptions
  - Use `getLogger(c)` from `context/logging` for server-side logging

## Project Structure & Module Organization

The project is a monorepo with the following structure:

- `server/`: Backend application (Bun, Hono, Drizzle, Better Auth).
  - `src/index.ts`: Server entry point.
  - `src/db/`: Database schema and configuration.
  - `src/auth/`: Authentication configuration.
- `web/`: Frontend application (Vite, React, Tailwind).
  - `src/main.tsx`: Frontend entry point.
  - `src/pages/`: Application pages.
  - `src/components/`: Reusable UI components.
- `justfile`: Root command runner.
- `package.json`: Root dependencies (linting, formatting) and workspace configuration.

## Build, Test, and Development Commands

**ALWAYS use `just` commands from the root directory.**

- **Start Development:** `just dev` (Runs server and web in parallel)
- **Run Tests:** `just test` (Runs server tests; web tests are currently not configured)
- **Database Migrations:**
  - Apply migrations: `just migrate`
  - Generate migrations: `just make-migrations`
- **Quality Check:** `just ready` (Runs format, lint, typecheck, tests, and build for both server and web)
- **Docker:**
  - Run server in Docker: `just run-server`

## Coding Style & Naming Conventions

- **Language:** TypeScript, ESM modules.
- **Indentation:** 2 spaces; max line length ~100 chars.
- **Naming:**
  - Variables/Functions: `camelCase`
  - Types/Classes/Components: `PascalCase`
  - Filenames: `kebab-case` (e.g., `user-profile.tsx`, `auth-service.ts`)
- **Frontend (Web):**
  - Use Functional Components with Hooks.
  - Styling: Tailwind CSS (v4).
  - UI Library: Radix UI Themes.
- **Backend (Server):**
  - Framework: Hono.
  - Database: Drizzle ORM.
- **Lint/Format:** Run `just format` to fix formatting issues. Match existing style.

## Testing Guidelines

- **Framework:** `bun:test` (Server).
- **Location:** Co-locate tests or use `__tests__` directories.
- **Scope:** Cover route behavior, database interactions, and edge cases.
- **Dependency Injection:** Use `createApp({ db, auth, logger })` pattern in server tests to override dependencies.
- **Run Tests:** `just test` (or `just server/test`).

## Security & Configuration Tips

- **Server Port:** Defaults to `3000`.
- **Dependencies:** Prefer Bun primitives (`Bun.file`, `bun:sqlite`) and Hono for routing. Avoid adding heavy frameworks unless necessary.
