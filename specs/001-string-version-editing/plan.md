# Implementation Plan: String Version History & Editing

**Branch**: `001-string-version-editing` | **Date**: February 1, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-string-version-editing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add version history viewing, draft publishing, and draft editing capabilities to the project page. Users will be able to:

1. View all translation snapshots (immutable published versions) in chronological order
2. Publish the current draft to create new immutable snapshots
3. Edit the current draft (strings table) which persists continuously between publishes
4. Compare different versions (P3 enhancement)

Technical approach leverages existing database schema (`strings` table for drafts, `translationSnapshots` table for immutable versions) and extends the project page UI to display version history with expandable/collapsible string rows.

## Technical Context

**Language/Version**: TypeScript (ES2022+), Bun v1.3+ (server runtime), Node 20+ (web build)  
**Primary Dependencies**:

- Server: Hono (routing), Drizzle ORM (database), Better Auth (authentication)
- Web: React 18, Vite (build), Radix UI Themes (components), react-intl (i18n)
  **Storage**: PostgreSQL with Drizzle ORM; existing tables: `strings` (draft), `translations` (draft translations), `translationSnapshots` (immutable published versions)  
  **Testing**: `bun:test` (server), `vitest` + Testing Library (web)  
  **Target Platform**: Web application (server-rendered SPA), modern browsers  
  **Project Type**: Monorepo (server + web packages)  
  **Performance Goals**:
- View version history for any string: <2 seconds (SC-001)
- Complete draft edit: <30 seconds (SC-003)
- Support projects with up to 10,000 string snapshots (SC-006)
  **Constraints**:
- API responses <200ms p95 latency
- All text must be translatable (react-intl)
- Zero data loss when editing drafts (SC-004)
- Immutable snapshots cannot be modified (SC-005)
  **Scale/Scope**:
- Extends existing project page UI
- New API endpoints for version history queries
- Edit capability for single string drafts
- Comparison UI (P3 - optional enhancement)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Quality Gates (Principle I)

- ✅ `just ready` will be run before claiming completion
- ✅ No ESLint suppressions will be added
- ✅ No `any` types will be used
- ✅ All deprecation warnings will be addressed

### Test-Driven Development (Principle II)

- ✅ Tests will be written FIRST for all new functionality
- ✅ Server tests will use `TestHelper` class for database setup
- ✅ Web tests will use `screen` from `@testing-library/react` (not `within(container)`)
- ✅ Tests will cover route behavior, database interactions, edge cases

### Type Safety (Principle III)

- ✅ Strong typing throughout; no `any` types
- ✅ Use `unknown` with type guards where type is truly unknown
- ✅ After validation, use `assert` to document guarantees
- ✅ Breaking interface changes will update ALL usages including tests

### UX Consistency (Principle IV)

- ✅ All user-facing text will use `react-intl` with `messages.ts` files
- ✅ Message IDs will be UPPERCASE with dot notation (e.g., `PROJECT.VERSION_HISTORY.TITLE`)
- ✅ All aria-labels will be translated using `useIntl` hook
- ✅ Tailwind CSS v4 and Radix UI Themes will be used

### Observability (Principle V)

- ✅ Errors will be logged using `getLogger(c).error()` with structured context
- ✅ Internal error details will not leak to API responses
- ✅ Generic error messages for exceptions to clients

### Performance (Principle VI)

- ✅ API responses will be <200ms p95 latency (verified in testing)
- ✅ Database queries will use proper indexes (existing: `translations_string_id_locale_idx`)
- ✅ Frontend will handle large lists (10k+ items) with virtualization or pagination

### GATE EVALUATION: ✅ PASS

No constitutional violations identified. This feature:

- Extends existing patterns (project page, API routes)
- Uses existing database schema (no new complexity)
- Follows monorepo structure conventions
- Adheres to all testing and type safety requirements

### POST-DESIGN RE-EVALUATION: ✅ PASS

After completing Phase 1 design (data-model, contracts, quickstart):

- No new dependencies introduced
- No schema changes required (leverages existing tables)
- API follows existing Hono + Drizzle patterns
- Frontend follows existing React + Radix UI patterns
- All constitutional principles upheld in design
- Complexity remains within acceptable bounds

## Project Structure

### Documentation (this feature)

```text
specs/001-string-version-editing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── projects/
│   │   ├── routes/
│   │   │   ├── list-string-versions.ts      # NEW: GET /:projectId/strings/:stringId/versions
│   │   │   ├── publish-snapshot.ts           # NEW: POST /:projectId/publish
│   │   │   ├── update-draft-string.ts        # NEW: PATCH /:projectId/strings/:stringId/draft
│   │   │   └── compare-versions.ts           # NEW (P3): GET /:projectId/strings/:stringId/compare
│   │   ├── repositories/
│   │   │   ├── strings-repository.ts         # EXTEND: Add version history queries
│   │   │   └── snapshots-repository.ts       # EXTEND: Add snapshot retrieval by version
│   │   ├── schemas.ts                        # EXTEND: Add schemas for new endpoints
│   │   └── __tests__/
│   │       ├── list-string-versions.test.ts  # NEW
│   │       ├── update-draft-string.test.ts   # NEW
│   │       └── compare-versions.test.ts      # NEW (P3)
│   └── db/
│       └── schema/
│           ├── strings.ts                    # EXISTING: Draft storage
│           └── translation-snapshots.ts      # EXISTING: Published versions

web/
├── src/
│   ├── pages/
│   │   └── project/
│   │       ├── project.tsx                   # EXTEND: Add version history UI
│   │       └── messages.ts                   # EXTEND: Add i18n messages
│   ├── projects/
│   │   ├── components/
│   │   │   ├── string-version-history/       # NEW: Component folder
│   │   │   │   ├── string-version-history.tsx
│   │   │   │   ├── string-version-history.test.tsx
│   │   │   │   ├── string-version-history.css
│   │   │   │   └── messages.ts
│   │   │   ├── draft-editor/                 # NEW: Component folder
│   │   │   │   ├── draft-editor.tsx
│   │   │   │   ├── draft-editor.test.tsx
│   │   │   │   ├── draft-editor.css
│   │   │   │   └── messages.ts
│   │   │   └── version-comparison/           # NEW (P3): Component folder
│   │   │       ├── version-comparison.tsx
│   │   │       ├── version-comparison.test.tsx
│   │   │       ├── version-comparison.css
│   │   │       └── messages.ts
│   │   └── hooks/
│   │       ├── use-string-versions.ts        # NEW: Hook for version history
│   │       ├── use-draft-editor.ts           # NEW: Hook for draft editing
│   │       └── use-version-comparison.ts     # NEW (P3): Hook for comparison
│   └── generated/
│       └── api-client/                       # REGENERATED: After API changes

tests/
├── server/src/projects/__tests__/            # NEW: Server integration tests
└── web/src/projects/components/__tests__/    # NEW: Component unit tests
```

**Structure Decision**: Web application (monorepo) structure selected. Server handles API routes for version queries and draft updates. Web extends existing project page with new components for version history display, draft editing, and version comparison. All new code follows existing patterns: kebab-case filenames, co-located tests and messages, TypeScript throughout.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This section is not applicable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
