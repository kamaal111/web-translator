# Tasks: Bulk String Editor

**Input**: Design documents from `/specs/002-bulk-string-editor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This feature specification requests TDD approach (Constitution Check: "Tests written before implementation"). All test tasks are included and MUST be written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a monorepo web application:

- **Server**: `server/src/`
- **Web**: `web/src/`
- **Tests**: Co-located `__tests__/` directories

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure project structure

- [x] T001 Install @tanstack/react-table dependency in web/ package
- [x] T002 [P] Install @tanstack/react-virtual dependency in web/ package
- [x] T003 [P] Create bulk editor components directory structure at web/src/projects/components/bulk-translation-editor/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core routing and navigation infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add /projects/:id/bulk-editor SPA route to WEB_ROUTES array in server/src/web/router.ts
- [x] T005 [P] Add test for /projects/:id/bulk-editor SPA route in server/src/web/**tests**/router.test.ts
- [x] T006 [P] Create lazy-loaded bulk editor page at web/src/pages/bulk-editor/bulk-editor.tsx
- [x] T007 Add /projects/:id/bulk-editor route to React Router in web/src/routing/router.tsx
- [x] T008 [P] Create react-intl messages file at web/src/projects/components/bulk-translation-editor/messages.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Batch Translation Entry (Priority: P1) 🎯 MVP

**Goal**: Enable users to view all strings in a table, edit any translation field inline, and save all changes with a single action

**Independent Test**: Open bulk editor → edit multiple translation fields across different strings/locales → click save once → verify all changes persist

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US1] Create page-level test file at web/src/pages/bulk-editor/**tests**/bulk-editor.test.tsx with tests for loading, rendering strings, error states
- [x] T010 [P] [US1] Create component test file at web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx with tests for editing cells, tracking dirty state, saving changes

### Implementation for User Story 1

- [x] T011 [P] [US1] Create BulkEditorRow type and data transformation utilities in web/src/projects/hooks/use-bulk-editor.ts
- [x] T012 [P] [US1] Create useBulkEditor hook with dirty tracking Map<string, Record<string, string>> in web/src/projects/hooks/use-bulk-editor.ts
- [x] T013 [US1] Implement BulkEditorPage component with project loading and error handling in web/src/projects/components/bulk-translation-editor/bulk-editor-page.tsx
- [x] T014 [US1] Implement BulkEditorTable component with TanStack Table setup in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [x] T015 [US1] Implement BulkEditorCell component with inline editing and onChange handlers in web/src/projects/components/bulk-translation-editor/bulk-editor-cell.tsx
- [x] T016 [US1] Implement BulkEditorHeader component with save button and dirty indicator in web/src/projects/components/bulk-translation-editor/bulk-editor-header.tsx
- [x] T017 [US1] Wire useBulkEditor save function to upsertTranslations API mutation (convert DirtyEdits Map to TranslationEntry array)
- [x] T018 [US1] Add keyboard navigation support (Tab/Shift+Tab, Enter to edit) to BulkEditorCell component in web/src/projects/components/bulk-translation-editor/bulk-editor-cell.tsx
- [x] T019 [US1] Implement unsaved changes warning using window beforeunload event in web/src/projects/components/bulk-translation-editor/bulk-editor-page.tsx
- [x] T020 [US1] Add publish button and dialog integration (calls publishSnapshot API) in web/src/projects/components/bulk-translation-editor/bulk-editor-header.tsx
- [x] T021 [US1] Connect lazy-loaded page component to BulkEditorPage with projectId from URL params in web/src/pages/bulk-editor/bulk-editor.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Empty Translation Identification (Priority: P2)

**Goal**: Visually distinguish empty/missing translations from completed ones for quick identification

**Independent Test**: Create project with some empty translations → open bulk editor → verify empty cells have distinct visual styling (background color/border)

### Tests for User Story 2

- [ ] T022 [P] [US2] Add tests for empty cell visual distinction to web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx

### Implementation for User Story 2

- [ ] T023 [US2] Add CSS conditional styling for empty cells in BulkEditorCell component in web/src/projects/components/bulk-translation-editor/bulk-editor-cell.tsx (use Radix UI Themes color tokens for distinct background)
- [ ] T024 [US2] Create BulkEditorProgress component showing translation completion per locale in web/src/projects/components/bulk-translation-editor/bulk-editor-progress.tsx
- [ ] T025 [US2] Integrate BulkEditorProgress into BulkEditorHeader component in web/src/projects/components/bulk-translation-editor/bulk-editor-header.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Search and Filter Strings (Priority: P3)

**Goal**: Allow filtering the bulk editor to show only strings matching search criteria by key or content

**Independent Test**: Open project with 100+ strings → enter search term in filter field → verify only matching strings visible → save changes → verify all modified strings (filtered and unfiltered) persist

### Tests for User Story 3

- [ ] T026 [P] [US3] Add tests for search/filter functionality to web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx (test filtering, clearing filter, save with active filter)

### Implementation for User Story 3

- [ ] T027 [US3] Create BulkEditorFilters component with search input and URL param sync in web/src/projects/components/bulk-translation-editor/bulk-editor-filters.tsx
- [ ] T028 [US3] Add global filter support to TanStack Table configuration in BulkEditorTable component in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T029 [US3] Implement client-side filter function (matches string key OR any translation value, case-insensitive) in BulkEditorTable component in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T030 [US3] Integrate BulkEditorFilters into BulkEditorPage component in web/src/projects/components/bulk-translation-editor/bulk-editor-page.tsx

**Checkpoint**: All user stories 1, 2, AND 3 should now be independently functional

---

## Phase 6: User Story 4 - Column Visibility Control (Priority: P3)

**Goal**: Allow users to show/hide specific locale columns to reduce visual clutter

**Independent Test**: Open project with 5+ locales → toggle column visibility to hide 3 locales → verify columns hidden → edit and save strings → verify hidden locales retain existing values

### Tests for User Story 4

- [ ] T031 [P] [US4] Add tests for column visibility controls to web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx

### Implementation for User Story 4

- [ ] T032 [US4] Create ColumnVisibilityMenu component with locale column checkboxes in web/src/projects/components/bulk-translation-editor/column-visibility-menu.tsx
- [ ] T033 [US4] Add column visibility state management to useBulkEditor hook in web/src/projects/hooks/use-bulk-editor.ts
- [ ] T034 [US4] Wire column visibility state to TanStack Table columnVisibility config in BulkEditorTable component in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T035 [US4] Integrate ColumnVisibilityMenu into BulkEditorFilters component in web/src/projects/components/bulk-translation-editor/bulk-editor-filters.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Performance Optimization

**Purpose**: Implement virtual scrolling for large projects (1000+ strings)

- [ ] T036 [P] Add tests for virtual scrolling performance with 1000+ strings to web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx
- [ ] T037 Integrate TanStack Virtual useVirtualizer into BulkEditorTable component in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T038 Configure row virtualization with fixed row height (~60px) and overscan (5-10 rows) in BulkEditorTable component in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T039 Update table rendering to use virtual row positioning in BulkEditorTable component in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, validation, and documentation

- [ ] T040 [P] Add i18n message translations for aria-labels and accessibility attributes in web/src/projects/components/bulk-translation-editor/messages.ts
- [ ] T041 [P] Add navigation link to bulk editor from project details page (button in header)
- [ ] T042 [P] Update messages.ts with all remaining UI text (loading states, error messages, tooltips) in web/src/projects/components/bulk-translation-editor/messages.ts
- [ ] T043 Add error logging for save operations using getLogger(c) pattern (if server-side changes needed)
- [ ] T044 [P] Test keyboard navigation with 100+ strings and verify Tab order with virtual scrolling
- [ ] T045 [P] Test save operation with 500+ modified translations to verify performance (<2s per SC-003)
- [ ] T046 Run quickstart.md validation workflow (setup, dev server, verify all features work)
- [ ] T047 Run `just ready` as final verification (format, lint, typecheck, tests, build)

---

## Phase 9: User Story 5 & 6 - String Creation & Deletion (Priority: P2)

**Goal**: Enable users to create new strings and delete existing strings directly from the bulk editor

**Independent Test**: Create a new string with translations → save → verify it persists. Delete an existing string → verify it's removed. Use undo within timeout → verify restoration.

### Backend - Delete String Endpoint (NEW)

- [ ] T048 [P] [US6] Create DELETE endpoint schema in server/src/strings/schemas.ts (DeleteStringParamsSchema, DeleteStringResponseSchema)
- [ ] T049 [US6] Create DELETE endpoint route handler at server/src/strings/routes/delete-string.ts
- [ ] T050 [P] [US6] Add deleteByKey method signature to server/src/strings/repositories/strings/types.ts
- [ ] T051 [P] [US6] Implement deleteByKey in server/src/strings/repositories/strings/implementation.ts (delete from strings table, cascade handles translations)
- [ ] T052 [US6] Register DELETE route in server/src/strings/router.ts
- [ ] T053 [P] [US6] Create comprehensive tests in server/src/strings/**tests**/delete-string.test.ts (success, not found, cascade behavior, auth checks)
- [ ] T054 [US6] Run `just download-spec` to update OpenAPI spec with new DELETE endpoint

### Tests for User Story 5 (String Creation)

- [ ] T055 [P] [US5] Add tests for string creation to web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx (add row, enter data, save, validation errors)

### Implementation for User Story 5 (String Creation)

- [ ] T056 [US5] Add "Add String" button to BulkEditorHeader component in web/src/projects/components/bulk-translation-editor/bulk-editor-header.tsx
- [ ] T057 [P] [US5] Create CreateStringRow component at web/src/projects/components/bulk-translation-editor/create-string-row.tsx (inline editable row with key, context, all locale fields)
- [ ] T058 [US5] Add creation state management to useBulkEditor hook in web/src/projects/hooks/use-bulk-editor.ts (isCreating flag, newStringData, validation)
- [ ] T059 [US5] Wire CreateStringRow to existing upsertTranslations mutation (no new API needed)
- [ ] T060 [US5] Implement key uniqueness validation in CreateStringRow (check against existing table data)
- [ ] T061 [US5] Add keyboard support to CreateStringRow (Escape to cancel, Tab navigation, Enter to save)
- [ ] T062 [US5] Integrate CreateStringRow into BulkEditorTable at top when isCreating=true in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T063 [P] [US5] Add i18n messages for creation UI in web/src/projects/components/bulk-translation-editor/messages.ts (button labels, placeholders, error messages)

### Tests for User Story 6 (String Deletion)

- [ ] T064 [P] [US6] Add tests for string deletion to web/src/projects/components/bulk-translation-editor/**tests**/bulk-editor-page.test.tsx (delete action, undo, API failure restoration)

### Implementation for User Story 6 (String Deletion)

- [ ] T065 [US6] Create deleteString mutation hook using new DELETE endpoint in web/src/projects/hooks/use-bulk-editor.ts
- [ ] T066 [US6] Add delete action column to BulkEditorTable with icon button in web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx
- [ ] T067 [P] [US6] Create UndoToast component at web/src/projects/components/bulk-translation-editor/undo-toast.tsx (shows after delete, timeout ~5s, undo button)
- [ ] T068 [US6] Implement optimistic delete in useBulkEditor hook (remove from table immediately, track pending deletes)
- [ ] T069 [US6] Implement undo logic in useBulkEditor hook (restore row within timeout, cancel API call if possible)
- [ ] T070 [US6] Implement auto-restoration on API failure in deleteString mutation error handler
- [ ] T071 [US6] Handle deletion of strings with unsaved edits (clear from dirty state when deleting)
- [ ] T072 [P] [US6] Add i18n messages for deletion UI in web/src/projects/components/bulk-translation-editor/messages.ts (delete button aria-label, undo toast text, error messages)

### Integration & Polish for User Stories 5 & 6

- [ ] T073 [P] Test complete creation workflow: add string → enter translations → save → verify persistence
- [ ] T074 [P] Test complete deletion workflow: delete string → verify removed → undo → verify restored
- [ ] T075 [P] Test edge case: create duplicate key → verify validation error
- [ ] T076 [P] Test edge case: delete string with unsaved edits → verify edits discarded
- [ ] T077 [P] Test edge case: delete fails due to network → verify auto-restoration
- [ ] T078 Update navigation link from project details to bulk editor if not already done
- [ ] T079 Run server tests: `just test-server`
- [ ] T080 Run web tests: `just test-web`
- [ ] T081 Run `just ready` as final verification for Phase 9

**Checkpoint**: User Stories 5 and 6 should be fully functional and independently testable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3 → P3)
- **Performance (Phase 7)**: Depends on User Story 1 (P1) completion - can run before P2/P3 stories if needed
- **Polish (Phase 8)**: Depends on all desired user stories being complete
- **String Creation & Deletion (Phase 9)**: Depends on Foundational (Phase 2) completion
  - Backend delete endpoint (T048-T054) must complete before frontend deletion UI (T064-T072)
  - Frontend creation UI (T055-T063) can start immediately (reuses existing API)
  - Can run in parallel with other user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (reuses existing upsert API)
- **User Story 6 (P2)**: Backend must complete first, then frontend can start - Independently testable from other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hook/utilities before components that use them
- Core components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- All Foundational tasks marked [P] (T005, T006, T008) can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task T009: "Create page-level test file..."
Task T010: "Create component test file..."

# Launch hook and basic types together:
Task T011: "Create BulkEditorRow type and data transformation..."
Task T012: "Create useBulkEditor hook with dirty tracking..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Dependencies installed
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) → Routes configured
3. Complete Phase 3: User Story 1 → Full editing, save, publish capability
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - this is a complete, usable bulk editor

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (P1) → Test independently → Deploy/Demo (MVP! - batch editing works)
3. Add User Story 2 (P2) → Test independently → Deploy/Demo (enhanced: visual feedback for empty)
4. Add User Story 5 (P2) → Test independently → Deploy/Demo (enhanced: string creation)
5. Add User Story 6 (P2) → Test independently → Deploy/Demo (enhanced: string deletion)
6. Add User Story 3 (P3) → Test independently → Deploy/Demo (enhanced: filtering)
7. Add User Story 4 (P3) → Test independently → Deploy/Demo (enhanced: column hiding)
8. Add Performance (Phase 7) → Handles 1000+ strings smoothly
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1) - Critical MVP
   - Developer B: User Story 2 (P2) - Empty translation indicators
   - Developer C: User Story 5 (P2) - String creation
   - Developer D: User Story 6 backend (P2) - DELETE endpoint, then User Story 6 frontend
   - Developer E: User Stories 3 & 4 (P3) - Filtering and column visibility
   - Developer F: Performance optimization (Phase 7)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD approach: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `just ready` before considering any phase complete
- Follow repository coding conventions (no ESLint suppression, no `any` types, no `!` assertions)
- All UI text must use react-intl messages (no hardcoded strings)
- Empty cell styling should use Radix UI Themes color tokens for consistency
- String deletion uses database FK CASCADE to automatically remove translations
- Published snapshots are immutable and NOT affected by string deletion
- Undo toast for deletion has ~5 second timeout before permanent deletion
- String creation reuses existing `upsertTranslations` API (no new endpoint needed)
