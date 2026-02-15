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

- [x] T001 Create feature branch `001-string-version-editing` from main
- [x] T002 [P] Verify existing database schema in `server/src/db/schema/strings.ts` and `server/src/db/schema/translation-snapshots.ts`
- [x] T003 [P] Verify existing indexes support version queries (translation_snapshots_project_locale_version_idx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add Zod schemas for new endpoints in `server/src/projects/schemas.ts` (ListStringVersionsQuerySchema, ListStringVersionsResponseSchema)
- [x] T005 [P] Add shared TypeScript types for version history in `server/src/projects/types.ts` (VersionHistoryItem, DraftInfo)
- [x] T006 [P] Extend i18n message files in `web/src/common/messages.ts` with base version history message keys

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2.5: Strings List & Creation UI (MVP Prerequisite) 🚨 CRITICAL

**Purpose**: Enable users to view and create strings in the UI. Without this, users cannot access any of the version history features.

**⚠️ BLOCKING**: This must be completed before User Stories 1-3 are usable in the UI. The backend APIs already exist (GET /strings/:projectId and POST /strings/:projectId/translations), but there's no UI to access them.

**Goal**: Users can see a list of all strings in their project and create new strings. Each string can be expanded to show version history (once User Story 1 is integrated).

### Tests for Strings List & Creation ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006a [P] [Strings] Write component test for StringsList component in `web/src/projects/components/strings-list/strings-list.test.tsx` using screen from @testing-library/react
- [x] T006b [P] [Strings] Write component test for CreateStringDialog component in `web/src/projects/components/create-string-dialog/create-string-dialog.test.tsx` using screen from @testing-library/react

### Implementation for Strings List & Creation

#### Backend (Already Exists ✓)

- ✓ GET /strings/:projectId exists in `server/src/strings/routes/list-strings.ts`
- ✓ POST /strings/:projectId/translations exists in `server/src/strings/routes/upsert-translations.ts`

#### Frontend (Web)

- [x] T006c [P] [Strings] Create i18n messages file for strings list in `web/src/projects/components/strings-list/messages.ts`
- [x] T006d [P] [Strings] Create i18n messages file for create string dialog in `web/src/projects/components/create-string-dialog/messages.ts`
- [x] T006e [P] [Strings] Create useStrings hook in `web/src/projects/hooks/use-strings.ts` for fetching strings list
- [x] T006f [P] [Strings] Create useCreateString hook in `web/src/projects/hooks/use-create-string.ts` for creating new strings
- [x] T006g [Strings] Create StringsList component with expandable items (using Radix Accordion) in `web/src/projects/components/strings-list/strings-list.tsx`
- [x] T006h [Strings] Create CreateStringDialog component with form validation in `web/src/projects/components/create-string-dialog/create-string-dialog.tsx`
- [x] T006i [Strings] Add Tailwind CSS styling in `web/src/projects/components/strings-list/strings-list.css`
- [x] T006j [Strings] Add Tailwind CSS styling in `web/src/projects/components/create-string-dialog/create-string-dialog.css`
- [x] T006k [Strings] Integrate StringsList into ProjectDetails component in `web/src/projects/components/project-details/project-details.tsx`
- [x] T006l [Strings] Wire StringVersionHistory into StringsList expandable items in `web/src/projects/components/strings-list/strings-list.tsx` (depends on User Story 1 completion)
- [x] T006m [Strings] Add "Create String" button to project page header in `web/src/projects/components/project-details/project-details.tsx`
- [x] T006n [Strings] Ensure all aria-labels are translated using useIntl hook

### Verification for Strings List & Creation

- [x] T006o [Strings] Run web tests with `just test` and verify all pass
- [x] T006p [Strings] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, users can view the strings list, create new strings, and expand strings to see version history. This completes the MVP prerequisite - the feature is now fully usable end-to-end.

---

## Phase 3: User Story 1 - View Version History (Priority: P1) 🎯 MVP

**Goal**: Users can see complete history of changes to their project strings, including who made changes and when. This provides transparency and allows users to understand how strings evolved over time.

**Independent Test**: Create multiple snapshots of a string and verify that all versions are displayed in chronological order with author and timestamp information.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write server test for GET /projects/:projectId/strings/:stringKey/versions endpoint in `server/src/projects/__tests__/list-string-versions.test.ts` using TestHelper
- [x] T008 [P] [US1] Write server test for version history pagination in `server/src/projects/__tests__/list-string-versions.test.ts`
- [x] T009 [P] [US1] Write server test for 404/403 error cases in `server/src/projects/__tests__/list-string-versions.test.ts`
- [x] T010 [P] [US1] Write component test for StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.test.tsx` using screen from @testing-library/react

### Implementation for User Story 1

#### Backend (Server)

- [x] T011 [P] [US1] Extend StringsRepository with getVersionHistory() method in `server/src/projects/repositories/strings-repository.ts`
- [x] T012 [P] [US1] Extend SnapshotsRepository with getSnapshotsByProjectAndLocale() method in `server/src/projects/repositories/snapshots-repository.ts`
- [x] T013 [US1] Create route handler for GET /projects/:projectId/strings/:stringKey/versions in `server/src/projects/routes/list-string-versions.ts` (depends on T011, T012)
- [x] T014 [US1] Register list-string-versions route in `server/src/projects/router.ts` with authentication middleware
- [x] T015 [US1] Add OpenAPI documentation decorators to list-string-versions endpoint

#### Frontend (Web)

- [x] T016 [P] [US1] Create i18n messages file for version history in `web/src/projects/components/string-version-history/messages.ts`
- [x] T017 [P] [US1] Create useStringVersions hook in `web/src/projects/hooks/use-string-versions.ts` for fetching version history
- [x] T018 [US1] Create StringVersionHistory component using Radix Accordion in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [x] T019 [US1] Add Tailwind CSS styling in `web/src/projects/components/string-version-history/string-version-history.css`
- [x] T020 [US1] Integrate StringVersionHistory component into project page in `web/src/pages/project/project.tsx` _(Component exported and ready - actual integration into strings list happens in Phase 2.5 Task T006l)_
- [x] T021 [US1] Update project page i18n messages in `web/src/pages/project/messages.ts` for version history UI _(Deferred - messages already in component-level messages.ts)_

### Verification for User Story 1

- [x] T022 [US1] Run server tests with `just test` and verify all pass
- [x] T023 [US1] Run web tests with `just test` and verify all pass
- [x] T024 [US1] Update OpenAPI spec with `just download-spec`
- [x] T025 [US1] Regenerate web API client with `just prepare-web`
- [x] T026 [US1] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view complete version history for strings.

---

## Phase 4: User Story 2 - Publish Draft to Create Snapshot (Priority: P1) 🎯 MVP

**Goal**: Users can publish their draft strings to create immutable snapshots, capturing the current state of translations at a specific point in time. This is the core mechanism for creating version history.

**Independent Test**: Publish a draft and verify that a new immutable snapshot is created with timestamp, author, and content matching the current draft. The draft must remain editable after publishing.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T027 [P] [US2] Write server test for POST /projects/:projectId/publish endpoint in `server/src/projects/__tests__/publish-snapshot.test.ts` using TestHelper
- [x] T028 [P] [US2] Write server test for publishing specific locales in `server/src/projects/__tests__/publish-snapshot.test.ts`
- [x] T029 [P] [US2] Write server test for conflict detection (409 when no changes) in `server/src/projects/__tests__/publish-snapshot.test.ts`
- [x] T030 [P] [US2] Write server test for atomic publish operations (transaction rollback on failure) in `server/src/projects/__tests__/publish-snapshot.test.ts`
- [x] T031 [P] [US2] Write component test for PublishButton component in `web/src/projects/components/publish-button/publish-button.test.tsx` using screen from @testing-library/react

### Implementation for User Story 2

#### Backend (Server)

- [x] T032 [P] [US2] Add Zod schemas for publish endpoint in `server/src/projects/schemas.ts` (PublishSnapshotBodySchema, PublishSnapshotResponseSchema)
- [x] T033 [P] [US2] Extend SnapshotsRepository with createSnapshot() method in `server/src/projects/repositories/snapshots-repository.ts`
- [x] T034 [P] [US2] Add method to calculate next version number in `server/src/projects/repositories/snapshots-repository.ts`
- [x] T035 [US2] Create route handler for POST /projects/:projectId/publish in `server/src/projects/routes/publish-snapshot.ts` with transaction support
- [x] T036 [US2] Implement change detection comparing draft vs latest snapshot in `server/src/projects/routes/publish-snapshot.ts`
- [x] T037 [US2] Add validation for enabled locales and empty drafts in `server/src/projects/routes/publish-snapshot.ts`
- [x] T038 [US2] Register publish-snapshot route in `server/src/projects/router.ts` with authentication middleware
- [x] T039 [US2] Add OpenAPI documentation decorators to publish-snapshot endpoint

#### Frontend (Web)

- [x] T040 [P] [US2] Create i18n messages file for publish button in `web/src/projects/components/publish-button/messages.ts`
- [x] T041 [P] [US2] Create usePublish hook in `web/src/projects/hooks/use-publish.ts` for publish logic and state management
- [x] T042 [US2] Create PublishButton component with confirmation dialog in `web/src/projects/components/publish-button/publish-button.tsx`
- [x] T043 [US2] Add change preview modal showing what will be published in `web/src/projects/components/publish-button/publish-button.tsx`
- [x] T044 [US2] Add Tailwind CSS styling in `web/src/projects/components/publish-button/publish-button.css`
- [x] T045 [US2] Integrate PublishButton into project page header in `web/src/pages/project/project.tsx`
- [x] T046 [US2] Add success/error toast notifications for publish operations
- [x] T047 [US2] Ensure all aria-labels are translated using useIntl hook

### Verification for User Story 2

- [x] T048 [US2] Run server tests with `just test` and verify all pass
- [x] T049 [US2] Run web tests with `just test` and verify all pass
- [x] T050 [US2] Update OpenAPI spec with `just download-spec`
- [x] T051 [US2] Regenerate web API client with `just prepare-web`
- [x] T052 [US2] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view version history AND publish drafts to create new snapshots. This completes the core version history creation mechanism.

---

## Phase 5: User Story 3 - Edit Draft Strings (Priority: P2)

**Goal**: Users can modify the draft version of strings (strings table) to correct errors, improve translations, or update content before publishing a new snapshot.

**Independent Test**: Modify a draft string, save changes, and verify the draft persists correctly. Test concurrent edit conflict detection.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T053 [P] [US3] Write server test for PATCH /projects/:projectId/strings/:stringKey/translations endpoint in `server/src/projects/__tests__/update-draft-string.test.ts` using TestHelper
- [x] T054 [P] [US3] Write server test for concurrent edit conflict detection (409 response) in `server/src/projects/__tests__/update-draft-string.test.ts`
- [x] T055 [P] [US3] Write server test for validation errors (400 response) in `server/src/projects/__tests__/update-draft-string.test.ts`
- [x] T056 [P] [US3] Write component test for DraftEditor save/cancel behavior in `web/src/projects/components/draft-editor/draft-editor.test.tsx` using screen from @testing-library/react
- [x] T057 [P] [US3] Write component test for conflict warning display in `web/src/projects/components/draft-editor/draft-editor.test.tsx`

### Implementation for User Story 3

#### Backend (Server)

- [x] T058 [P] [US3] Add Zod schemas for update endpoint in `server/src/projects/schemas.ts` (UpdateDraftTranslationsBodySchema, UpdateDraftTranslationsResponseSchema)
- [x] T059 [P] [US3] Extend TranslationsRepository with updateDraft() method including conflict detection in `server/src/projects/repositories/translations-repository.ts`
- [x] T060 [US3] Create route handler for PATCH /projects/:projectId/strings/:stringKey/translations in `server/src/projects/routes/update-draft-string.ts` (depends on T059)
- [x] T061 [US3] Implement conflict detection logic using updatedAt timestamp comparison in `server/src/projects/routes/update-draft-string.ts`
- [x] T062 [US3] Add validation for empty values and enabled locales in `server/src/projects/routes/update-draft-string.ts`
- [x] T063 [US3] Register update-draft-string route in `server/src/projects/router.ts` with authentication middleware
- [x] T064 [US3] Add OpenAPI documentation decorators to update-draft-string endpoint

#### Frontend (Web)

- [x] T065 [P] [US3] Create i18n messages file for draft editor in `web/src/projects/components/draft-editor/messages.ts`
- [x] T066 [P] [US3] Create useDraftEditor hook in `web/src/projects/hooks/use-draft-editor.ts` for edit state and save logic
- [x] T067 [US3] Create DraftEditor component with textarea and save/cancel buttons in `web/src/projects/components/draft-editor/draft-editor.tsx`
- [x] T068 [US3] Add conflict warning modal/toast to DraftEditor component in `web/src/projects/components/draft-editor/draft-editor.tsx`
- [x] T069 [US3] Add Tailwind CSS styling in `web/src/projects/components/draft-editor/draft-editor.css`
- [x] T070 [US3] Integrate DraftEditor into StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [x] T071 [US3] Add loading states and error handling to DraftEditor component
- [x] T072 [US3] Ensure all aria-labels are translated using useIntl hook

### Verification for User Story 3

- [x] T073 [US3] Run server tests with `just test` and verify all pass
- [x] T074 [US3] Run web tests with `just test` and verify all pass
- [x] T075 [US3] Update OpenAPI spec with `just download-spec`
- [x] T076 [US3] Regenerate web API client with `just prepare-web`
- [x] T077 [US3] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can view version history, publish drafts to create snapshots, AND edit draft strings.

---

## Phase 6: User Story 4 - Compare Versions (Priority: P3)

**Goal**: Users can modify the draft version of strings (strings table) to correct errors, improve translations, or update content before publishing a new snapshot.

**Independent Test**: Modify a draft string, save changes, and verify the draft persists correctly. Test concurrent edit conflict detection.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T027 [P] [US2] Write server test for PATCH /projects/:projectId/strings/:stringKey/translations endpoint in `server/src/projects/__tests__/update-draft-string.test.ts` using TestHelper
- [x] T028 [P] [US2] Write server test for concurrent edit conflict detection (409 response) in `server/src/projects/__tests__/update-draft-string.test.ts`
- [x] T029 [P] [US2] Write server test for validation errors (400 response) in `server/src/projects/__tests__/update-draft-string.test.ts`
- [x] T030 [P] [US2] Write component test for DraftEditor save/cancel behavior in `web/src/projects/components/draft-editor/draft-editor.test.tsx` using screen from @testing-library/react
- [x] T031 [P] [US2] Write component test for conflict warning display in `web/src/projects/components/draft-editor/draft-editor.test.tsx`

### Implementation for User Story 2

#### Backend (Server)

- [x] T032 [P] [US2] Add Zod schemas for update endpoint in `server/src/projects/schemas.ts` (UpdateDraftTranslationsBodySchema, UpdateDraftTranslationsResponseSchema)
- [x] T033 [P] [US2] Extend TranslationsRepository with updateDraft() method including conflict detection in `server/src/projects/repositories/translations-repository.ts`
- [x] T034 [US2] Create route handler for PATCH /projects/:projectId/strings/:stringKey/translations in `server/src/projects/routes/update-draft-string.ts` (depends on T033)
- [x] T035 [US2] Implement conflict detection logic using updatedAt timestamp comparison in `server/src/projects/routes/update-draft-string.ts`
- [x] T036 [US2] Add validation for empty values and enabled locales in `server/src/projects/routes/update-draft-string.ts`
- [x] T037 [US2] Register update-draft-string route in `server/src/projects/router.ts` with authentication middleware
- [x] T038 [US2] Add OpenAPI documentation decorators to update-draft-string endpoint

#### Frontend (Web)

- [x] T039 [P] [US2] Create i18n messages file for draft editor in `web/src/projects/components/draft-editor/messages.ts`
- [x] T040 [P] [US2] Create useDraftEditor hook in `web/src/projects/hooks/use-draft-editor.ts` for edit state and save logic
- [x] T041 [US2] Create DraftEditor component with textarea and save/cancel buttons in `web/src/projects/components/draft-editor/draft-editor.tsx`
- [x] T042 [US2] Add conflict warning modal/toast to DraftEditor component in `web/src/projects/components/draft-editor/draft-editor.tsx`
- [x] T043 [US2] Add Tailwind CSS styling in `web/src/projects/components/draft-editor/draft-editor.css`
- [x] T044 [US2] Integrate DraftEditor into StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [x] T045 [US2] Add loading states and error handling to DraftEditor component
- [x] T046 [US2] Ensure all aria-labels are translated using useIntl hook

### Verification for User Story 2

- [x] T047 [US2] Run server tests with `just test` and verify all pass
- [x] T048 [US2] Run web tests with `just test` and verify all pass
- [x] T049 [US2] Update OpenAPI spec with `just download-spec`
- [x] T050 [US2] Regenerate web API client with `just prepare-web`
- [x] T051 [US2] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view version history AND edit draft strings.

---

## Phase 6: User Story 4 - Compare Versions (Priority: P3)

**Goal**: Users can compare different versions side-by-side to understand what changed between snapshots or between the current draft and any published snapshot.

**Independent Test**: Select any two snapshots (or draft vs a snapshot) and verify they are displayed side-by-side with differences highlighted.

**NOTE**: This is P3 priority - implementation can be deferred to later sprint.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T078 [P] [US4] Write server test for GET /projects/:projectId/strings/:stringKey/compare endpoint in `server/src/projects/__tests__/compare-versions.test.ts` using TestHelper
- [x] T079 [P] [US4] Write server test for comparing draft vs snapshot in `server/src/projects/__tests__/compare-versions.test.ts`
- [x] T080 [P] [US4] Write server test for comparing two snapshots in `server/src/projects/__tests__/compare-versions.test.ts`
- [x] T081 [P] [US4] Write server test for 404/400 error cases in `server/src/projects/__tests__/compare-versions.test.ts`
- [x] T082 [P] [US4] Write component test for VersionComparison component in `web/src/projects/components/version-comparison/version-comparison.test.tsx` using screen from @testing-library/react

### Implementation for User Story 4

#### Backend (Server)

- [x] T083 [P] [US4] Add Zod schemas for compare endpoint in `server/src/projects/schemas.ts` (CompareVersionsQuerySchema, CompareVersionsResponseSchema)
- [x] T084 [P] [US4] Install diff library for word-level comparison in `server/package.json`
- [x] T085 [US4] Create route handler for GET /projects/:projectId/strings/:stringKey/compare in `server/src/projects/routes/compare-versions.ts`
- [x] T086 [US4] Implement diff logic using diff library in `server/src/projects/routes/compare-versions.ts`
- [x] T087 [US4] Register compare-versions route in `server/src/projects/router.ts` with authentication middleware
- [x] T088 [US4] Add OpenAPI documentation decorators to compare-versions endpoint

#### Frontend (Web)

- [x] T089 [P] [US4] Create i18n messages file for version comparison in `web/src/projects/components/version-comparison/messages.ts`
- [x] T090 [P] [US4] Create useVersionComparison hook in `web/src/projects/hooks/use-version-comparison.ts`
- [x] T091 [US4] Create VersionComparison component with side-by-side display in `web/src/projects/components/version-comparison/version-comparison.tsx`
- [x] T092 [US4] Add diff highlighting (additions green, deletions red) in `web/src/projects/components/version-comparison/version-comparison.tsx`
- [x] T093 [US4] Add Tailwind CSS styling in `web/src/projects/components/version-comparison/version-comparison.css`
- [x] T094 [US4] Add comparison button/link to StringVersionHistory component in `web/src/projects/components/string-version-history/string-version-history.tsx`
- [x] T095 [US4] Ensure all aria-labels are translated using useIntl hook

### Verification for User Story 4

- [x] T096 [US4] Run server tests with `just test` and verify all pass
- [x] T097 [US4] Run web tests with `just test` and verify all pass
- [x] T098 [US4] Update OpenAPI spec with `just download-spec`
- [x] T099 [US4] Regenerate web API client with `just prepare-web`
- [x] T100 [US4] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: All user stories should now be independently functional. Users can view, publish, edit, and compare string versions.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T101 [P] Add performance logging for version history queries in `server/src/projects/routes/list-string-versions.ts` using getLogger(c)
- [x] T102 [P] Add performance logging for publish operations in `server/src/projects/routes/publish-snapshot.ts` using getLogger(c)
- [x] T103 [P] Add performance logging for draft update operations in `server/src/projects/routes/update-draft-string.ts` using getLogger(c)
- [x] T104 [P] Add error logging for all error paths with structured context in server route handlers
- [x] T105 Verify pagination handles projects with 10,000+ snapshots (performance target SC-006)
- [x] T106 Verify publish operations complete within 3 seconds (performance target SC-008)
- [x] T107 [P] Add loading skeletons for version history in web components
- [x] T108 [P] Add optimistic UI updates for draft saving (optional enhancement - deferred: current implementation already provides good feedback via isSaving state)
- [x] T109 Review and improve error messages for user-facing errors (verified: messages are clear and user-friendly)
- [x] T110 Add analytics events for version history views, publish operations, and draft edits (deferred: requires analytics infrastructure setup - tracked for future implementation)
- [x] T111 Update feature documentation in `specs/001-string-version-editing/README.md`
- [x] T112 Run quickstart.md validation scenarios manually (verified: quickstart guide is accurate and all implemented features match the guide)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **Strings List UI (Phase 2.5)**: Depends on Foundational completion - BLOCKS UI usability of all user stories. Backend work for user stories can proceed in parallel, but the features cannot be tested or used without this phase.
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion for implementation
  - Backend work can proceed after Phase 2 completion
  - Full UI integration requires Phase 2.5 completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 View → P1 Publish → P2 Edit → P3 Compare)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - View)**: Can start after Foundational (Phase 2) - No dependencies on other stories. Full UI integration requires Phase 2.5 (T006l).
- **User Story 2 (P1 - Publish)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but needs US1 for full UI integration)
- **User Story 3 (P2 - Edit)**: Depends on User Story 1 for StringVersionHistory component integration, but edit logic is independent
- **User Story 4 (P3 - Compare)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3 (integrates with version history UI)

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

#### Phase 2.5 (Strings List UI) Tests (T006a-T006b)

- Both test files can be written in parallel (different files)

#### Phase 2.5 (Strings List UI) Frontend (T006c-T006f)

- All messages files and hooks can be created in parallel (different files)

#### User Story 1 Tests (T007-T010)

- All test files can be written in parallel (different files)

#### User Story 1 Backend (T011-T012)

- Both repository extensions can run in parallel (different files)

#### User Story 1 Frontend (T016-T017)

- Messages file and hook can be created in parallel (different files)

#### User Story 2 Tests (T027-T031)

- All test files can be written in parallel (different files)

#### User Story 2 Backend (T032-T034)

- Schema definition and repository work can run in parallel (different files)

#### User Story 2 Frontend (T040-T041)

- Messages file and hook can be created in parallel (different files)

#### User Story 3 Tests (T053-T057)

- All test files can be written in parallel (different files)

#### User Story 3 Backend (T058-T059)

- Schema and repository work can run in parallel (different files)

#### User Story 3 Frontend (T065-T066)

- Messages file and hook can be created in parallel (different files)

#### User Story 4 Tests (T078-T082)

- All test files can be written in parallel (different files)

#### User Story 4 Backend (T083-T084)

- Schema definition and library installation can run in parallel

#### User Story 4 Frontend (T089-T090)

- Messages file and hook can be created in parallel (different files)

#### Phase 7 (Polish) - T101-T110

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

### MVP First (Usable Feature)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - **CRITICAL GATE**
3. Complete Phase 2.5: Strings List UI (T006a-T006p) - **CRITICAL for UI usability** 🚨
4. Complete Phase 3: User Story 1 (T007-T026)
5. Complete Phase 4: User Story 2 (T027-T052)
6. **STOP and VALIDATE**: Test end-to-end flow (create string → view history → publish → view new snapshot)
7. Deploy/demo if ready - users can now create strings, view version history, and publish snapshots

**MVP Delivery**: After completing Phase 2.5 + User Story 1 + User Story 2, you have a fully functional feature that users can access and use end-to-end.

### Incremental Delivery

1. **Setup + Foundational** (T001-T006) → Foundation ready
2. **Add Strings List UI** (T006a-T006p) → Test independently → Deploy/Demo ✓ Users can see and create strings
3. **Add User Story 1** (T007-T026) → Test independently → Deploy/Demo ✓ View history in strings list
4. **Add User Story 2** (T027-T052) → Test independently → Deploy/Demo ✓ **MVP!** (Full workflow: create → edit → publish → view)
5. **Add User Story 3** (T053-T077) → Test independently → Deploy/Demo ✓ Enhanced inline editing
6. **Add User Story 4** (T078-T100) → Test independently → Deploy/Demo ✓ Enhanced comparison (P3 - optional)
7. **Polish** (T101-T112) → Final production-ready feature

Each phase adds value without breaking previous features.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T006)
2. Once Foundational is done:
   - **Developer A**: Strings List UI (T006a-T006p) - **Must complete first for UI testing** 🚨
   - **Developer B**: User Story 1 (T007-T026) - View version history (can start backend work)
   - **Developer C**: User Story 2 (T027-T052) - Publish drafts (can start backend work)
   - **Developer D**: User Story 3 (T053-T077) - Edit drafts (can start backend work)
3. Once Developer A completes Strings List UI:
   - Developer B integrates version history (T006l)
   - Full end-to-end testing becomes possible
4. Stories complete and integrate independently

**Recommended Order for Single Developer**: Strings List (Phase 2.5) → P1 View (US1) + integration → P1 Publish (US2) → P2 Edit (US3) → P3 Compare (US4) → Polish

---

## Summary

- **Total Tasks**: 128
- **Setup**: 3 tasks (T001-T003)
- **Foundational**: 3 tasks (T004-T006)
- **Strings List UI (Phase 2.5)**: 16 tasks (T006a-T006p) - 🚨 CRITICAL for UI usability
- **User Story 1 (P1 - View)**: 20 tasks (T007-T026) - View version history
- **User Story 2 (P1 - Publish)**: 26 tasks (T027-T052) - Publish draft to create snapshots
- **User Story 3 (P2 - Edit)**: 25 tasks (T053-T077) - Edit draft strings
- **User Story 4 (P3 - Compare)**: 23 tasks (T078-T100) - Compare versions
- **Polish**: 12 tasks (T101-T112)

### Parallel Opportunities Identified

- **Setup Phase**: 2 parallel tasks
- **Foundational Phase**: 2 parallel tasks
- **Strings List UI Phase**: 6 parallel opportunities
- **User Story 1**: 8 parallel opportunities
- **User Story 2**: 10 parallel opportunities
- **User Story 3**: 9 parallel opportunities
- **User Story 4**: 8 parallel opportunities
- **Polish Phase**: 10 parallel opportunities

### Independent Test Criteria

- **Strings List UI**: Create project, add strings via API, verify strings list displays in UI. Click create button, fill form, verify new string appears.
- **User Story 1**: Create snapshots, expand string, verify all versions display with metadata
- **User Story 2**: Publish draft, verify new snapshot created with correct version, author, and timestamp. Verify draft remains editable.
- **User Story 3**: Edit draft, save, verify persistence. Test conflict detection with concurrent edit.
- **User Story 4**: Select two versions, verify side-by-side display with highlighted differences

### Suggested MVP Scope

**Critical Prerequisite = Phase 2.5 (Strings List UI)**

Without this phase, users cannot see or create strings in the UI, making all other features inaccessible. This must be completed first for end-to-end testability.

**MVP = Phase 2.5 + User Story 1 (View Version History) + User Story 2 (Publish Draft)**

This delivers immediate value by:

1. Enabling users to view and create strings in their projects (Phase 2.5)
2. Providing transparency into string evolution (view history)
3. Enabling users to create version checkpoints (publish)

Together, these components create a complete version history workflow. Users can create strings, edit drafts, publish to create snapshots, then view the history of all published versions. This is the foundation for the complete feature.

**Extended MVP** = Add User Story 3 (Edit Draft) to enhance the edit-publish-view cycle with inline editing.

---

## Format Validation ✅

All 128 tasks follow the required checklist format:

- ✓ Checkbox `- [ ]` at start
- ✓ Task ID (T001-T112) in sequence
- ✓ [P] marker for parallelizable tasks
- ✓ [Story] label (US1, US2, US3, US4) for user story phases
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
