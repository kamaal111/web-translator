---
description: 'Task list for String Version History & Editing feature'
---

# Tasks: String Version History & Editing

**Input**: Design documents from `/specs/001-string-version-editing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are written FIRST (TDD approach) as mandated by repository constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **Checkbox**: ALWAYS starts with `- [ ]` (markdown checkbox)
- **[ID]**: Sequential task number (T001, T002, T003...)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a monorepo with `server/` and `web/` directories at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. No new dependencies needed - feature uses existing tech stack.

- [ ] T001 Create feature branch `001-string-version-editing` from main
- [ ] T002 [P] Verify existing database schema in `server/src/db/schema/strings.ts` and `server/src/db/schema/translation-snapshots.ts`
- [ ] T003 [P] Verify existing indexes support version queries (translation_snapshots_project_locale_version_idx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Add Zod schemas for new endpoints in `server/src/projects/schemas.ts` (ListStringVersionsQuerySchema, ListStringVersionsResponseSchema)
- [ ] T005 [P] Add shared TypeScript types for version history in `server/src/projects/types.ts` (VersionHistoryItem, DraftInfo)
- [ ] T006 [P] Extend i18n message files in `web/src/common/messages.ts` with base version history message keys

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Version History (Priority: P1) 🎯 MVP

**Goal**: Users can see complete history of changes to their project strings, including who made changes and when. This provides transparency and allows users to understand how strings evolved over time.

**Independent Test**: Create multiple snapshots of a string and verify that all versions are displayed in chronological order with author and timestamp information.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Write server test for GET /projects/:projectId/strings/:stringKey/versions endpoint in `server/src/projects/__tests__/list-string-versions.test.ts` using TestHelper
- [ ] T008 [P] [US1] Write server test for version history pagination in `server/src/projects/__tests__/list-string-versions.test.ts`
- [ ] T009 [P] [US1] Write server test for 404/403 error cases in `server/src/projects/__tests__/list-string-versions.test.ts`
- [ ] T010 [P] [US1] Write component test for StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.test.tsx` using screen from @testing-library/react

### Implementation for User Story 1

#### Backend (Server)

- [ ] T011 [P] [US1] Extend StringsRepository with getVersionHistory() method in `server/src/projects/repositories/strings-repository.ts`
- [ ] T012 [P] [US1] Extend SnapshotsRepository with getSnapshotsByProjectAndLocale() method in `server/src/projects/repositories/snapshots-repository.ts`
- [ ] T013 [US1] Create route handler for GET /projects/:projectId/strings/:stringKey/versions in `server/src/projects/routes/list-string-versions.ts` (depends on T011, T012)
- [ ] T014 [US1] Register list-string-versions route in `server/src/projects/router.ts` with authentication middleware
- [ ] T015 [US1] Add OpenAPI documentation decorators to list-string-versions endpoint

#### Frontend (Web)

- [ ] T016 [P] [US1] Create i18n messages file for version history in `web/src/projects/components/string-version-history/messages.ts`
- [ ] T017 [P] [US1] Create useStringVersions hook in `web/src/projects/hooks/use-string-versions.ts` for fetching version history
- [ ] T018 [US1] Create StringVersionHistory component using Radix Accordion in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [ ] T019 [US1] Add Tailwind CSS styling in `web/src/projects/components/string-version-history/string-version-history.css`
- [ ] T020 [US1] Integrate StringVersionHistory component into project page in `web/src/pages/project/project.tsx`
- [ ] T021 [US1] Update project page i18n messages in `web/src/pages/project/messages.ts` for version history UI

### Verification for User Story 1

- [ ] T022 [US1] Run server tests with `just test` and verify all pass
- [ ] T023 [US1] Run web tests with `just test` and verify all pass
- [ ] T024 [US1] Update OpenAPI spec with `just download-spec`
- [ ] T025 [US1] Regenerate web API client with `just prepare-web`
- [ ] T026 [US1] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view complete version history for strings.

---

## Phase 4: User Story 2 - Edit Draft Strings (Priority: P2)

**Goal**: Users can modify the draft version of strings (strings table) to correct errors, improve translations, or update content before publishing a new snapshot.

**Independent Test**: Modify a draft string, save changes, and verify the draft persists correctly. Test concurrent edit conflict detection.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US2] Write server test for PATCH /projects/:projectId/strings/:stringKey/translations endpoint in `server/src/projects/__tests__/update-draft-string.test.ts` using TestHelper
- [ ] T028 [P] [US2] Write server test for concurrent edit conflict detection (409 response) in `server/src/projects/__tests__/update-draft-string.test.ts`
- [ ] T029 [P] [US2] Write server test for validation errors (400 response) in `server/src/projects/__tests__/update-draft-string.test.ts`
- [ ] T030 [P] [US2] Write component test for DraftEditor save/cancel behavior in `web/src/projects/components/draft-editor/draft-editor.test.tsx` using screen from @testing-library/react
- [ ] T031 [P] [US2] Write component test for conflict warning display in `web/src/projects/components/draft-editor/draft-editor.test.tsx`

### Implementation for User Story 2

#### Backend (Server)

- [ ] T032 [P] [US2] Add Zod schemas for update endpoint in `server/src/projects/schemas.ts` (UpdateDraftTranslationsBodySchema, UpdateDraftTranslationsResponseSchema)
- [ ] T033 [P] [US2] Extend TranslationsRepository with updateDraft() method including conflict detection in `server/src/projects/repositories/translations-repository.ts`
- [ ] T034 [US2] Create route handler for PATCH /projects/:projectId/strings/:stringKey/translations in `server/src/projects/routes/update-draft-string.ts` (depends on T033)
- [ ] T035 [US2] Implement conflict detection logic using updatedAt timestamp comparison in `server/src/projects/routes/update-draft-string.ts`
- [ ] T036 [US2] Add validation for empty values and enabled locales in `server/src/projects/routes/update-draft-string.ts`
- [ ] T037 [US2] Register update-draft-string route in `server/src/projects/router.ts` with authentication middleware
- [ ] T038 [US2] Add OpenAPI documentation decorators to update-draft-string endpoint

#### Frontend (Web)

- [ ] T039 [P] [US2] Create i18n messages file for draft editor in `web/src/projects/components/draft-editor/messages.ts`
- [ ] T040 [P] [US2] Create useDraftEditor hook in `web/src/projects/hooks/use-draft-editor.ts` for edit state and save logic
- [ ] T041 [US2] Create DraftEditor component with textarea and save/cancel buttons in `web/src/projects/components/draft-editor/draft-editor.tsx`
- [ ] T042 [US2] Add conflict warning modal/toast to DraftEditor component in `web/src/projects/components/draft-editor/draft-editor.tsx`
- [ ] T043 [US2] Add Tailwind CSS styling in `web/src/projects/components/draft-editor/draft-editor.css`
- [ ] T044 [US2] Integrate DraftEditor into StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [ ] T045 [US2] Add loading states and error handling to DraftEditor component
- [ ] T046 [US2] Ensure all aria-labels are translated using useIntl hook

### Verification for User Story 2

- [ ] T047 [US2] Run server tests with `just test` and verify all pass
- [ ] T048 [US2] Run web tests with `just test` and verify all pass
- [ ] T049 [US2] Update OpenAPI spec with `just download-spec`
- [ ] T050 [US2] Regenerate web API client with `just prepare-web`
- [ ] T051 [US2] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view version history AND edit draft strings.

---

## Phase 5: User Story 3 - Compare Versions (Priority: P3)

**Goal**: Users can compare different versions side-by-side to understand what changed between snapshots or between the current draft and any published snapshot.

**Independent Test**: Select any two snapshots (or draft vs a snapshot) and verify they are displayed side-by-side with differences highlighted.

**NOTE**: This is P3 priority - implementation can be deferred to later sprint.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T052 [P] [US3] Write server test for GET /projects/:projectId/strings/:stringKey/compare endpoint in `server/src/projects/__tests__/compare-versions.test.ts` using TestHelper
- [ ] T053 [P] [US3] Write server test for comparing draft vs snapshot in `server/src/projects/__tests__/compare-versions.test.ts`
- [ ] T054 [P] [US3] Write server test for comparing two snapshots in `server/src/projects/__tests__/compare-versions.test.ts`
- [ ] T055 [P] [US3] Write server test for 404/400 error cases in `server/src/projects/__tests__/compare-versions.test.ts`
- [ ] T056 [P] [US3] Write component test for VersionComparison component in `web/src/projects/components/version-comparison/version-comparison.test.tsx` using screen from @testing-library/react

### Implementation for User Story 3

#### Backend (Server)

- [ ] T057 [P] [US3] Add Zod schemas for compare endpoint in `server/src/projects/schemas.ts` (CompareVersionsQuerySchema, CompareVersionsResponseSchema)
- [ ] T058 [P] [US3] Install diff library for word-level comparison in `server/package.json`
- [ ] T059 [US3] Create route handler for GET /projects/:projectId/strings/:stringKey/compare in `server/src/projects/routes/compare-versions.ts`
- [ ] T060 [US3] Implement diff logic using diff library in `server/src/projects/routes/compare-versions.ts`
- [ ] T061 [US3] Register compare-versions route in `server/src/projects/router.ts` with authentication middleware
- [ ] T062 [US3] Add OpenAPI documentation decorators to compare-versions endpoint

#### Frontend (Web)

- [ ] T063 [P] [US3] Create i18n messages file for version comparison in `web/src/projects/components/version-comparison/messages.ts`
- [ ] T064 [P] [US3] Create useVersionComparison hook in `web/src/projects/hooks/use-version-comparison.ts`
- [ ] T065 [US3] Create VersionComparison component with side-by-side display in `web/src/projects/components/version-comparison/version-comparison.tsx`
- [ ] T066 [US3] Add diff highlighting (additions green, deletions red) in `web/src/projects/components/version-comparison/version-comparison.tsx`
- [ ] T067 [US3] Add Tailwind CSS styling in `web/src/projects/components/version-comparison/version-comparison.css`
- [ ] T068 [US3] Add comparison button/link to StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [ ] T069 [US3] Ensure all aria-labels are translated using useIntl hook

### Verification for User Story 3

- [ ] T070 [US3] Run server tests with `just test` and verify all pass
- [ ] T071 [US3] Run web tests with `just test` and verify all pass
- [ ] T072 [US3] Update OpenAPI spec with `just download-spec`
- [ ] T073 [US3] Regenerate web API client with `just prepare-web`
- [ ] T074 [US3] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: All user stories should now be independently functional. Users can view, edit, and compare string versions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T075 [P] Add performance logging for version history queries in `server/src/projects/routes/list-string-versions.ts` using getLogger(c)
- [ ] T076 [P] Add performance logging for draft update operations in `server/src/projects/routes/update-draft-string.ts` using getLogger(c)
- [ ] T077 [P] Add error logging for all error paths with structured context in server route handlers
- [ ] T078 Verify pagination handles projects with 10,000+ snapshots (performance target SC-006)
- [ ] T079 [P] Add loading skeletons for version history in web components
- [ ] T080 [P] Add optimistic UI updates for draft saving (optional enhancement)
- [ ] T081 Review and improve error messages for user-facing errors
- [ ] T082 Add analytics events for version history views and draft edits
- [ ] T083 Update feature documentation in `specs/001-string-version-editing/README.md`
- [ ] T084 Run quickstart.md validation scenarios manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 for StringVersionHistory component integration, but edit logic is independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (integrates with version history UI)

### Within Each User Story

1. **Tests FIRST** - Write all tests and ensure they FAIL before implementation
2. **Backend Repository Layer** - Data access methods
3. **Backend Route Handlers** - API endpoints
4. **Backend Router Registration** - Wire up routes
5. **Frontend Hooks** - Data fetching and state management
6. **Frontend Components** - UI implementation
7. **Frontend Integration** - Wire into page
8. **Verification** - Run all tests and `just ready`

### Parallel Opportunities

#### Phase 1 (Setup)

- T002 and T003 can run in parallel (different verification tasks)

#### Phase 2 (Foundational)

- T005 and T006 can run in parallel (different files)

#### User Story 1 Tests (T007-T010)

- All test files can be written in parallel (different files)

#### User Story 1 Backend (T011-T012)

- Both repository extensions can run in parallel (different files)

#### User Story 1 Frontend (T016-T017)

- Messages file and hook can be created in parallel (different files)

#### User Story 2 Tests (T027-T031)

- All test files can be written in parallel (different files)

#### User Story 2 Backend (T032-T033)

- Schema and repository work can run in parallel (different files)

#### User Story 2 Frontend (T039-T040)

- Messages file and hook can be created in parallel (different files)

#### User Story 3 Tests (T052-T056)

- All test files can be written in parallel (different files)

#### User Story 3 Backend (T057-T058)

- Schema definition and library installation can run in parallel

#### User Story 3 Frontend (T063-T064)

- Messages file and hook can be created in parallel (different files)

#### Phase 6 (Polish) - T075-T082

- All logging, performance, and enhancement tasks can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Write all tests together:
- T007: server/src/projects/__tests__/list-string-versions.test.ts
- T008: server/src/projects/__tests__/list-string-versions.test.ts (same file, different test cases)
- T009: server/src/projects/__tests__/list-string-versions.test.ts (same file, different test cases)
- T010: web/src/projects/components/string-version-history/string-version-history.test.tsx

# Implement backend repositories together:
- T011: server/src/projects/repositories/strings-repository.ts
- T012: server/src/projects/repositories/snapshots-repository.ts

# Create frontend foundation together:
- T016: web/src/projects/components/string-version-history/messages.ts
- T017: web/src/projects/hooks/use-string-versions.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T007-T026)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - users can now view complete version history

**MVP Delivery**: After completing User Story 1, you have a minimal viable feature that delivers immediate value (version transparency).

### Incremental Delivery

1. **Setup + Foundational** (T001-T006) → Foundation ready
2. **Add User Story 1** (T007-T026) → Test independently → Deploy/Demo ✅ **MVP!**
3. **Add User Story 2** (T027-T051) → Test independently → Deploy/Demo ✅ Full editing capability
4. **Add User Story 3** (T052-T074) → Test independently → Deploy/Demo ✅ Enhanced comparison
5. **Polish** (T075-T084) → Final production-ready feature

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T006)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T007-T026) - View version history
   - **Developer B**: User Story 2 (T027-T051) - Edit drafts (can start after US1 component exists)
   - **Developer C**: User Story 3 (T052-T074) - Compare versions (independent)
3. Stories complete and integrate independently

**Recommended Order for Single Developer**: P1 (US1) → P2 (US2) → P3 (US3) → Polish

---

## Summary

- **Total Tasks**: 84
- **User Story 1 (P1)**: 20 tasks (T007-T026) - View version history
- **User Story 2 (P2)**: 25 tasks (T027-T051) - Edit draft strings
- **User Story 3 (P3)**: 23 tasks (T052-T074) - Compare versions
- **Setup**: 3 tasks (T001-T003)
- **Foundational**: 3 tasks (T004-T006)
- **Polish**: 10 tasks (T075-T084)

### Parallel Opportunities Identified

- **Setup Phase**: 2 parallel tasks
- **Foundational Phase**: 2 parallel tasks
- **User Story 1**: 8 parallel opportunities
- **User Story 2**: 9 parallel opportunities
- **User Story 3**: 8 parallel opportunities
- **Polish Phase**: 8 parallel opportunities

### Independent Test Criteria

- **User Story 1**: Create snapshots, expand string, verify all versions display with metadata
- **User Story 2**: Edit draft, save, verify persistence. Test conflict detection with concurrent edit.
- **User Story 3**: Select two versions, verify side-by-side display with highlighted differences

### Suggested MVP Scope

**MVP = User Story 1 (View Version History)**

This delivers immediate value by providing transparency into string evolution. Users can see complete history, authors, and timestamps. This is the foundation for informed editing decisions (User Story 2).

---

## Format Validation ✅

All 84 tasks follow the required checklist format:

- ✅ Checkbox `- [ ]` at start
- ✅ Task ID (T001-T084) in sequence
- ✅ [P] marker for parallelizable tasks
- ✅ [Story] label (US1, US2, US3) for user story phases
- ✅ Clear descriptions with exact file paths
- ✅ No story labels for Setup, Foundational, and Polish phases

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD MANDATORY**: Verify tests fail before implementing (Constitution Principle II)
- **CRITICAL**: Run `just ready` after each user story completion - NON-NEGOTIABLE
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No ESLint suppressions allowed - fix underlying issues
- No `any` types - use proper typing with `unknown` and type guards
- All text must be translatable using react-intl
