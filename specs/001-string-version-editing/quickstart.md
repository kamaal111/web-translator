# Quickstart: String Version History & Editing

**Feature**: String Version History & Editing  
**Date**: February 1, 2026  
**Phase**: 1 - Design & Contracts

This guide provides a quick overview for developers implementing the string version history and editing feature.

## Overview

This feature adds three main capabilities to the project page:

1. **View version history** - Display all published snapshots and current draft for each string
2. **Edit draft strings** - Allow users to modify draft translations before publishing
3. **Compare versions** - Side-by-side comparison of any two versions (P3 priority)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Project Page (React)                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ StringList                                         │ │
│  │  ├─ StringVersionHistory (Accordion)               │ │
│  │  │   ├─ Draft (editable)                          │ │
│  │  │   │   └─ DraftEditor                           │ │
│  │  │   └─ Snapshots (read-only list)               │ │
│  │  └─ VersionComparison (P3)                        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│                   Hono API Server                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GET /projects/:id/strings/:key/versions           │ │
│  │ PATCH /projects/:id/strings/:key/translations     │ │
│  │ GET /projects/:id/strings/:key/compare (P3)       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓ Database
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL (Drizzle)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ strings (draft keys)                              │ │
│  │ translations (draft values per locale)            │ │
│  │ translationSnapshots (immutable published)        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Implementation Checklist

### Phase 1: Backend API (Priority P1 + P2)

- [ ] **Create route handler**: `server/src/projects/routes/list-string-versions.ts`
  - GET endpoint for version history
  - Query `translationSnapshots` and `translations` tables
  - Implement pagination (20 items per page)
  - Add Zod schema validation

- [ ] **Create route handler**: `server/src/projects/routes/update-draft-string.ts`
  - PATCH endpoint for draft updates
  - Conflict detection using `updatedAt` timestamps
  - Validate locales against project's `enabledLocales`
  - Return 409 on concurrent edits within 5 minutes

- [ ] **Extend repositories**:
  - `server/src/projects/repositories/strings-repository.ts`: Add `getVersionHistory()`
  - `server/src/projects/repositories/translations-repository.ts`: Add `updateDraft()` with conflict check

- [ ] **Add schemas**: `server/src/projects/schemas.ts`
  - `ListStringVersionsQuerySchema` (stringKey, locale, page, pageSize)
  - `UpdateDraftTranslationsBodySchema` (translations: Record<locale, value>, ifUnmodifiedSince)
  - Response schemas for OpenAPI docs

- [ ] **Write tests**: `server/src/projects/__tests__/`
  - `list-string-versions.test.ts` (TestHelper for setup)
  - `update-draft-string.test.ts` (test conflict detection)

- [ ] **Update router**: `server/src/projects/router.ts`
  - Register new routes
  - Ensure authentication middleware applied

### Phase 2: Frontend UI (Priority P1 + P2)

- [ ] **Create component**: `web/src/projects/components/string-version-history/`
  - `string-version-history.tsx` (Radix Accordion for expand/collapse)
  - `string-version-history.test.tsx` (use `screen` from Testing Library)
  - `string-version-history.css` (Tailwind styling)
  - `messages.ts` (i18n with react-intl)

- [ ] **Create component**: `web/src/projects/components/draft-editor/`
  - `draft-editor.tsx` (editable textarea with save/cancel)
  - `draft-editor.test.tsx`
  - `draft-editor.css`
  - `messages.ts`

- [ ] **Create hooks**: `web/src/projects/hooks/`
  - `use-string-versions.ts` (fetch version history, pagination)
  - `use-draft-editor.ts` (edit state, save, conflict handling)

- [ ] **Extend page**: `web/src/pages/project/project.tsx`
  - Integrate StringVersionHistory component
  - Add expand/collapse UI for string list
  - Update `messages.ts` with new i18n keys

- [ ] **Update API client**: `web/src/generated/api-client/`
  - Run `just download-spec` to update OpenAPI spec
  - Run `just prepare-web` to regenerate client

### Phase 3: Version Comparison (Priority P3 - Optional)

- [ ] **Create route handler**: `server/src/projects/routes/compare-versions.ts`
  - GET endpoint for comparison
  - Use `diff` library for word-level diffs

- [ ] **Create component**: `web/src/projects/components/version-comparison/`
  - `version-comparison.tsx` (side-by-side display with highlighting)
  - `version-comparison.test.tsx`
  - `version-comparison.css`
  - `messages.ts`

- [ ] **Create hook**: `web/src/projects/hooks/use-version-comparison.ts`

## Key Files to Reference

### Server Patterns

- **Route structure**: `server/src/projects/routes/list-projects.ts` (example)
- **Repository pattern**: `server/src/projects/repositories/projects-repository.ts`
- **Schema definition**: `server/src/projects/schemas.ts`
- **Test setup**: `server/src/__tests__/test-helper.ts` (TestHelper class)

### Web Patterns

- **Component structure**: `web/src/projects/components/project-details/`
- **Hook pattern**: `web/src/projects/hooks/use-project.ts`
- **Page integration**: `web/src/pages/project/project.tsx`
- **i18n pattern**: `web/src/projects/components/project-details/messages.ts`

### Database

- **Existing schema**: `server/src/db/schema/strings.ts`, `translation-snapshots.ts`
- **Migration tool**: Use `just make-migrations` if schema changes needed (none for this feature)

## Development Workflow

1. **Start services**:

   ```bash
   just start-services  # Starts Postgres
   just dev             # Starts server + web
   ```

2. **TDD Approach** (Constitution Principle II):
   - Write test FIRST (e.g., `list-string-versions.test.ts`)
   - Run test, verify it FAILS
   - Implement feature
   - Run test, verify it PASSES
   - ONLY THEN claim work is complete

3. **Before committing**:

   ```bash
   just ready  # Runs format, lint, typecheck, tests, build
   ```

   **CRITICAL**: Must pass before claiming completion!

4. **Update API docs**:
   ```bash
   just download-spec    # Updates web/src/openapi.yaml
   just prepare-web      # Regenerates TypeScript client
   ```

## Testing Strategy

### Server Tests (bun:test)

- Use `TestHelper` class for database setup
- Sign in as default user: `helper.signInAsDefaultUser()`
- Test all error cases (404, 403, 409, 400)
- Verify conflict detection logic

### Web Tests (vitest)

- Use `screen` from `@testing-library/react` (NEVER `within(container)`)
- Mock API calls with MSW or vitest mocks
- Test expand/collapse behavior
- Test edit form submission and cancellation
- Verify all text is translatable (no hardcoded strings)

## Performance Targets

From Success Criteria:

- **SC-001**: View version history in <2 seconds
- **SC-003**: Complete draft edit in <30 seconds
- **SC-006**: Support 10k+ snapshots (use pagination!)

Monitor with:

```typescript
console.time('version-history-load');
// fetch version history
console.timeEnd('version-history-load');
```

## Common Pitfalls to Avoid

❌ **DON'T**:

- Add ESLint suppressions (fix the issue instead)
- Use `any` type (use `unknown` with type guards)
- Use hardcoded strings in UI (always use react-intl)
- Skip tests (TDD is mandatory)
- Use `within(container)` in tests (use `screen` directly)
- Run dev servers yourself (use `just dev`)

✅ **DO**:

- Run `just ready` before claiming completion
- Write tests FIRST
- Use `getLogger(c).error()` for server errors
- Translate all aria-labels with `useIntl`
- Use Radix UI components
- Follow kebab-case for filenames

## User Stories Implementation Order

1. **P1**: User Story 1 - View Version History
   - Backend: `list-string-versions` endpoint
   - Frontend: `StringVersionHistory` component (read-only)
   - Tests: Full coverage

2. **P2**: User Story 2 - Edit Draft Strings
   - Backend: `update-draft-string` endpoint
   - Frontend: `DraftEditor` component
   - Tests: Including conflict detection

3. **P3**: User Story 3 - Compare Versions (deferred)
   - Backend: `compare-versions` endpoint
   - Frontend: `VersionComparison` component
   - Tests: Full coverage

## Next Steps

After completing this plan:

1. Run `/speckit.tasks` command to generate detailed task breakdown
2. Create feature branch: `git checkout -b 001-string-version-editing`
3. Begin implementation with P1 (view version history)
4. Follow TDD: test → fail → implement → pass → refactor

## Questions?

Refer to:

- [spec.md](../spec.md) - Full requirements
- [research.md](../research.md) - Technical decisions
- [data-model.md](../data-model.md) - Database patterns
- [contracts/api-specification.md](../contracts/api-specification.md) - API details
- [AGENTS.md](/Users/kamaal/Projects/JavaScript/web-translator/AGENTS.md) - Repository guidelines
