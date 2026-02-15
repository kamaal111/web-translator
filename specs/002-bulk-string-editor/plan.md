# Implementation Plan: Bulk String Editor

**Branch**: `002-bulk-string-editor` | **Date**: 2026-02-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-bulk-string-editor/spec.md`

## Summary

Implement a spreadsheet-like bulk string editor that displays all project strings and translations in a tabular format, allowing inline editing, string creation, string deletion, and single-save batch updates. The feature reuses existing backend APIs (`upsertTranslations`, `publishSnapshot`, `listStrings`) for editing and creation, and adds a new DELETE endpoint for string removal. Primary focus is frontend implementation using TanStack Table with virtual scrolling for performance.

## Technical Context

**Language/Version**: TypeScript (ESM), Bun 1.3+ (server), Vite + React 19 (web)
**Primary Dependencies**: Hono, Drizzle ORM, React, TanStack Table, TanStack Virtual, TanStack Query, Radix UI Themes, react-intl
**Storage**: PostgreSQL (existing `strings`, `translations`, `translation_snapshots` tables)
**Testing**: `bun:test` (server), `vitest` + Testing Library (web)
**Target Platform**: Desktop web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (monorepo: `server/` + `web/` + `modules/`)
**Performance Goals**: Load <3s for 500 strings × 5 locales; 60fps scrolling; save <2s
**Constraints**: <200ms p95 API responses; virtual scrolling for 1000+ strings
**Scale/Scope**: Projects with 10–5000 strings, 2–10 locales per project

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                   | Status  | Notes                                                                                                 |
| --------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| I. Quality Gates            | ✅ PASS | `just ready` will be run. No ESLint suppression. No `any` types.                                      |
| II. Test-Driven Development | ✅ PASS | Tests written before implementation for all components and endpoints.                                 |
| III. Type Safety            | ✅ PASS | All types derived from Zod schemas and generated OpenAPI client. No `any`.                            |
| IV. UX Consistency          | ✅ PASS | All text via `react-intl` `defineMessages`. Radix UI Themes. Tailwind CSS v4. Aria-labels translated. |
| V. Observability            | ✅ PASS | Structured logging for save operations. Generic error messages in API responses.                      |
| VI. Performance             | ✅ PASS | Virtual scrolling (TanStack Virtual). Existing indexed queries. Debounced validation.                 |

## Project Structure

### Documentation (this feature)

```text
specs/002-bulk-string-editor/
├── plan.md              # This file
├── research.md          # Phase 0: unknowns resolved
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: developer onboarding
├── contracts/           # Phase 1: API contract documentation
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── strings/
│   │   ├── routes/
│   │   │   └── delete-string.ts         # NEW: DELETE endpoint
│   │   ├── repositories/
│   │   │   └── strings/
│   │   │       ├── types.ts             # Add deleteByKey method
│   │   │       └── implementation.ts    # Implement deleteByKey
│   │   ├── router.ts                    # Register DELETE route
│   │   ├── schemas.ts                   # Add delete schemas
│   │   └── __tests__/
│   │       └── delete-string.test.ts    # NEW: tests
│   └── web/
│       └── router.ts                    # Add /projects/:id/bulk-editor SPA route

web/
├── src/
│   ├── projects/
│   │   ├── hooks/
│   │   │   └── use-bulk-editor.ts          # NEW: bulk editor state management
│   │   └── components/
│   │       └── bulk-translation-editor/    # NEW: bulk editor components
│   │           ├── bulk-editor-page.tsx
│   │           ├── bulk-editor-table.tsx
│   │           ├── bulk-editor-cell.tsx
│   │           ├── bulk-editor-header.tsx
│   │           ├── bulk-editor-filters.tsx
│   │           ├── column-visibility-menu.tsx
│   │           ├── bulk-editor-progress.tsx
│   │           ├── create-string-row.tsx    # NEW: inline string creation
│   │           ├── undo-toast.tsx           # NEW: deletion undo
│   │           ├── messages.ts
│   │           └── __tests__/
│   │               └── bulk-editor-page.test.tsx
│   ├── pages/
│   │   └── bulk-editor/                    # NEW: lazy-loaded page
│   │       ├── bulk-editor.tsx
│   │       └── __tests__/
│   │           └── bulk-editor.test.tsx
│   └── routing/
│       └── router.tsx                      # Add /projects/:id/bulk-editor route
```

**Structure Decision**: Web application monorepo. Frontend-heavy feature using existing `web/src/projects/` module conventions. Bulk editor components placed in `web/src/projects/components/bulk-translation-editor/` (directory already exists, currently empty). New page in `web/src/pages/bulk-editor/`. Server changes include new DELETE endpoint in `server/src/strings/` and SPA route registration.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
