---
description: 'Task list for Bulk String Editor feature'
---

# Tasks: Bulk String Editor

**Input**: Design documents from `/specs/002-bulk-string-editor/`
**Prerequisites**: plan.md, spec.md

**Tests**: Tests are written FIRST (TDD approach) as mandated by repository constitution.

**Organization**: Tasks are grouped by implementation phase to enable efficient sequential delivery.

## Format: `- [ ] [ID] [P?] [Phase] Description`

- **Checkbox**: ALWAYS starts with `- [ ]` (markdown checkbox)
- **[ID]**: Sequential task number (T001, T002, T003...)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Phase]**: Which phase this task belongs to (e.g., Setup, MVP, Filters, UX, Perf)
- Include exact file paths in descriptions

## Path Conventions

This is a monorepo with `server/` and `web/` directories at the repository root.

---

## Phase 1: Setup & Foundation

**Purpose**: Project initialization and preparation for bulk editor implementation.

- [ ] T001 Create feature branch `002-bulk-string-editor` from main
- [ ] T002 [P] Review existing `GET /app-api/v1/s/:projectId` endpoint capabilities in `server/src/strings/routes/list-strings.ts`
- [ ] T003 [P] Review existing strings schema and indexes in `server/src/db/schema/strings.ts`
- [ ] T004 [P] Install frontend dependencies: @tanstack/react-table and @tanstack/react-virtual in `web/package.json`
- [ ] T005 [P] Add base i18n message keys for bulk editor in `web/src/common/messages.ts`

**Checkpoint**: Foundation ready - can begin MVP implementation

---

## Phase 2: Core Backend (MVP)

**Purpose**: Implement bulk update API endpoint with validation and conflict detection

### Tests for Bulk Update Endpoint ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T006 [P] [MVP] Write server test for successful bulk update in `server/src/strings/__tests__/bulk-update.test.ts` using TestHelper
- [ ] T007 [P] [MVP] Write server test for conflict detection (modified by other user) in `server/src/strings/__tests__/bulk-update.test.ts`
- [ ] T008 [P] [MVP] Write server test for validation errors (invalid locale, string not found) in `server/src/strings/__tests__/bulk-update.test.ts`
- [ ] T009 [P] [MVP] Write server test for partial success (some succeed, some fail) in `server/src/strings/__tests__/bulk-update.test.ts`
- [ ] T010 [P] [MVP] Write server test for max request size limit (500 strings) in `server/src/strings/__tests__/bulk-update.test.ts`
- [ ] T011 [P] [MVP] Write server test for transaction atomicity in `server/src/strings/__tests__/bulk-update.test.ts`

### Implementation for Bulk Update Backend

- [ ] T012 [P] [MVP] Add Zod schemas for bulk update endpoint in `server/src/strings/schemas.ts` (BulkUpdateRequestSchema, BulkUpdateResponseSchema)
- [ ] T013 [P] [MVP] Create validation utility for translations in `server/src/strings/utils/validate-translations.ts`
- [ ] T014 [MVP] Extend StringsRepository with update() method in `server/src/strings/repositories/strings-repository.ts`
- [ ] T015 [MVP] Create route handler for PATCH /strings/:projectId/bulk in `server/src/strings/routes/bulk-update.ts` (depends on T014)
- [ ] T016 [MVP] Implement conflict detection using ifUnmodifiedSince timestamp comparison in `server/src/strings/routes/bulk-update.ts`
- [ ] T017 [MVP] Implement validation logic (enabled locales, max length) in `server/src/strings/routes/bulk-update.ts`
- [ ] T018 [MVP] Implement transaction-based atomic updates in `server/src/strings/routes/bulk-update.ts`
- [ ] T019 [MVP] Add partial success handling (updated/conflicts/errors arrays) in `server/src/strings/routes/bulk-update.ts`
- [ ] T020 [MVP] Register bulk-update route in `server/src/strings/router.ts` with authentication middleware
- [ ] T021 [MVP] Add OpenAPI documentation decorators to bulk-update endpoint
- [ ] T022 [MVP] Add rate limiting to bulk endpoint (10 req/min) in route registration

### Verification for Backend

- [ ] T023 [MVP] Run server tests with `just test` and verify all pass
- [ ] T024 [MVP] Update OpenAPI spec with `just download-spec`
- [ ] T025 [MVP] Regenerate web API client with `just prepare-web`
- [ ] T026 [MVP] Run `just ready` to verify format, lint, typecheck, tests, and build all pass

**Checkpoint**: Backend API complete and tested - ready for frontend integration

---

## Phase 3: Core Frontend (MVP)

**Purpose**: Implement basic bulk editor page with grid view and save functionality

### Tests for Bulk Editor Components ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [MVP] Write component test for BulkEditorPage rendering strings grid in `web/src/projects/components/bulk-editor/bulk-editor-page.test.tsx` using screen from @testing-library/react
- [ ] T028 [P] [MVP] Write component test for BulkEditorCell editing and dirty state in `web/src/projects/components/bulk-editor/bulk-editor-cell.test.tsx`
- [ ] T029 [P] [MVP] Write component test for save all functionality in `web/src/projects/components/bulk-editor/bulk-editor-page.test.tsx`
- [ ] T030 [P] [MVP] Write component test for conflict dialog display in `web/src/projects/components/bulk-editor/conflict-dialog.test.tsx`
- [ ] T031 [P] [MVP] Write component test for validation error display in `web/src/projects/components/bulk-editor/bulk-editor-page.test.tsx`

### Implementation for Bulk Editor Frontend

#### Routing and Navigation

- [ ] T032 [P] [MVP] Add bulk editor route to React Router in `web/src/routing/router.tsx`
- [ ] T033 [P] [MVP] Add bulk editor route to SPA routes config in `server/src/web/router.ts`
- [ ] T034 [P] [MVP] Add "Bulk Editor" button/link to project details page in `web/src/projects/components/project-details/project-details.tsx`

#### Core Components

- [ ] T035 [P] [MVP] Create i18n messages file for bulk editor in `web/src/projects/components/bulk-editor/messages.ts`
- [ ] T036 [P] [MVP] Create useBulkEditor hook for state management in `web/src/projects/hooks/use-bulk-editor.ts`
- [ ] T037 [P] [MVP] Create useBulkEditorValidation hook in `web/src/projects/hooks/use-bulk-editor-validation.ts`
- [ ] T038 [P] [MVP] Create useDirtyTracking hook in `web/src/projects/hooks/use-dirty-tracking.ts`
- [ ] T039 [MVP] Create BulkEditorPage component with basic layout in `web/src/projects/components/bulk-editor/bulk-editor-page.tsx`
- [ ] T040 [MVP] Create BulkEditorHeader component with save button in `web/src/projects/components/bulk-editor/bulk-editor-header.tsx`
- [ ] T041 [MVP] Create BulkEditorTable component using TanStack Table in `web/src/projects/components/bulk-editor/bulk-editor-table.tsx` (depends on T039)
- [ ] T042 [MVP] Create BulkEditorCell component with textarea for editing in `web/src/projects/components/bulk-editor/bulk-editor-cell.tsx`
- [ ] T043 [MVP] Add column configuration (String Key, Context, locales) in `web/src/projects/components/bulk-editor/bulk-editor-table.tsx`
- [ ] T044 [MVP] Implement dirty state tracking and indicators in `web/src/projects/components/bulk-editor/bulk-editor-cell.tsx`
- [ ] T045 [MVP] Create ConflictDialog component for displaying conflicts in `web/src/projects/components/bulk-editor/conflict-dialog.tsx`
- [ ] T046 [MVP] Implement save all logic with bulk update API call in `web/src/projects/hooks/use-bulk-editor.ts`
- [ ] T047 [MVP] Add conflict resolution UI (keep yours/keep theirs) in `web/src/projects/components/bulk-editor/conflict-dialog.tsx`
- [ ] T048 [MVP] Add validation error display per cell in `web/src/projects/components/bulk-editor/bulk-editor-cell.tsx`

#### Styling

- [ ] T049 [P] [MVP] Add Tailwind CSS styling for BulkEditorPage in `web/src/projects/components/bulk-editor/bulk-editor-page.css`
- [ ] T050 [P] [MVP] Add Tailwind CSS styling for BulkEditorTable (grid layout) in `web/src/projects/components/bulk-editor/bulk-editor-table.css`
- [ ] T051 [P] [MVP] Add Tailwind CSS styling for BulkEditorCell in `web/src/projects/components/bulk-editor/bulk-editor-cell.css`
- [ ] T052 [P] [MVP] Add Tailwind CSS styling for ConflictDialog in `web/src/projects/components/bulk-editor/conflict-dialog.css`

#### Accessibility and Polish

- [ ] T053 [MVP] Ensure all buttons and inputs have translated aria-labels using useIntl hook
- [ ] T054 [MVP] Add loading states (spinner) while fetching strings
- [ ] T055 [MVP] Add saving states (disable cells, show progress) during bulk save
- [ ] T056 [MVP] Add empty state message when project has no strings
- [ ] T057 [MVP] Add unsaved changes indicator in header (count of dirty cells)

### Verification for Frontend MVP

- [ ] T058 [MVP] Run web tests with `just test` and verify all pass
- [ ] T059 [MVP] Run `just ready` to verify format, lint, typecheck, tests, and build all pass
- [ ] T060 [MVP] Manually test complete workflow: load strings → edit multiple cells → save → verify updates

**Checkpoint**: MVP complete! Users can view all strings in grid, edit multiple translations, and save all at once.

---

## Phase 4: Filtering and Search

**Purpose**: Add filtering capabilities to help users work on specific subsets of strings

### Tests for Filtering ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T061 [P] [Filters] Write component test for filter by missing translations in `web/src/projects/components/bulk-editor/bulk-editor-filters.test.tsx`
- [ ] T062 [P] [Filters] Write component test for filter by key pattern in `web/src/projects/components/bulk-editor/bulk-editor-filters.test.tsx`
- [ ] T063 [P] [Filters] Write component test for filter by context in `web/src/projects/components/bulk-editor/bulk-editor-filters.test.tsx`
- [ ] T064 [P] [Filters] Write component test for filter persistence in URL params in `web/src/projects/components/bulk-editor/bulk-editor-filters.test.tsx`

### Implementation for Filtering

- [ ] T065 [P] [Filters] Create i18n messages for filters in `web/src/projects/components/bulk-editor/filters-messages.ts`
- [ ] T066 [P] [Filters] Create useBulkEditorFilters hook with URL state in `web/src/projects/hooks/use-bulk-editor-filters.ts`
- [ ] T067 [Filters] Create BulkEditorFilters component in `web/src/projects/components/bulk-editor/bulk-editor-filters.tsx`
- [ ] T068 [Filters] Add missing translations filter dropdown in `web/src/projects/components/bulk-editor/bulk-editor-filters.tsx`
- [ ] T069 [Filters] Add key pattern search input in `web/src/projects/components/bulk-editor/bulk-editor-filters.tsx`
- [ ] T070 [Filters] Add context filter input in `web/src/projects/components/bulk-editor/bulk-editor-filters.tsx`
- [ ] T071 [Filters] Implement filter logic in useBulkEditorFilters hook
- [ ] T072 [Filters] Add filtered results count indicator in `web/src/projects/components/bulk-editor/bulk-editor-header.tsx`
- [ ] T073 [Filters] Add clear all filters button in `web/src/projects/components/bulk-editor/bulk-editor-filters.tsx`
- [ ] T074 [Filters] Add Tailwind CSS styling for filters in `web/src/projects/components/bulk-editor/bulk-editor-filters.css`
- [ ] T075 [Filters] Integrate BulkEditorFilters into BulkEditorPage layout in `web/src/projects/components/bulk-editor/bulk-editor-page.tsx`
- [ ] T076 [Filters] Ensure all filter labels are translated using useIntl hook

### Verification for Filtering

- [ ] T077 [Filters] Run web tests with `just test` and verify all pass
- [ ] T078 [Filters] Run `just ready` to verify format, lint, typecheck, tests, and build all pass
- [ ] T079 [Filters] Manually test filtering by missing translations, key pattern, and context

**Checkpoint**: Users can efficiently filter strings to work on specific subsets

---

## Phase 5: Enhanced UX

**Purpose**: Improve usability with keyboard navigation, progress tracking, and safety features

### Tests for Enhanced UX ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T080 [P] [UX] Write component test for unsaved changes warning on navigation in `web/src/projects/components/bulk-editor/bulk-editor-page.test.tsx`
- [ ] T081 [P] [UX] Write component test for progress indicators in `web/src/projects/components/bulk-editor/progress-bar.test.tsx`
- [ ] T082 [P] [UX] Write component test for keyboard navigation (Tab, Enter) in `web/src/projects/components/bulk-editor/bulk-editor-table.test.tsx`

### Implementation for Enhanced UX

#### Unsaved Changes Protection

- [ ] T083 [P] [UX] Create useUnsavedChangesWarning hook in `web/src/projects/hooks/use-unsaved-changes-warning.ts`
- [ ] T084 [UX] Implement browser beforeunload event handler in useUnsavedChangesWarning hook
- [ ] T085 [UX] Implement React Router blocker for internal navigation in useUnsavedChangesWarning hook
- [ ] T086 [UX] Add UnsavedChangesDialog component for navigation confirmation in `web/src/projects/components/bulk-editor/unsaved-changes-dialog.tsx`
- [ ] T087 [UX] Integrate unsaved changes warning into BulkEditorPage in `web/src/projects/components/bulk-editor/bulk-editor-page.tsx`

#### Progress Tracking

- [ ] T088 [P] [UX] Create BulkEditorProgressBar component in `web/src/projects/components/bulk-editor/bulk-editor-progress-bar.tsx`
- [ ] T089 [UX] Calculate translation completion percentage per locale in `web/src/projects/hooks/use-bulk-editor.ts`
- [ ] T090 [UX] Display progress bars for each locale in BulkEditorProgressBar component
- [ ] T091 [UX] Add real-time progress updates as user fills translations
- [ ] T092 [UX] Add Tailwind CSS styling for progress bars in `web/src/projects/components/bulk-editor/bulk-editor-progress-bar.css`
- [ ] T093 [UX] Integrate progress bar into BulkEditorPage header

#### Keyboard Navigation

- [ ] T094 [P] [UX] Create useKeyboardNavigation hook in `web/src/projects/hooks/use-keyboard-navigation.ts`
- [ ] T095 [UX] Implement Tab key navigation between cells
- [ ] T096 [UX] Implement Enter key to move to next row
- [ ] T097 [UX] Implement Arrow key navigation (optional enhancement)
- [ ] T098 [UX] Add keyboard shortcuts indicator (? key for help) in `web/src/projects/components/bulk-editor/keyboard-shortcuts-help.tsx`
- [ ] T099 [UX] Integrate keyboard navigation into BulkEditorTable

#### Copy-Paste Support

- [ ] T100 [P] [UX] Add clipboard paste handler for cells in `web/src/projects/components/bulk-editor/bulk-editor-cell.tsx`
- [ ] T101 [UX] Support pasting multiple cells at once (from spreadsheet)
- [ ] T102 [UX] Add copy handler for exporting selected cells

#### Additional Polish

- [ ] T103 [P] [UX] Add empty cell warning indicators (⚠️ icon) in `web/src/projects/components/bulk-editor/bulk-editor-cell.tsx`
- [ ] T104 [P] [UX] Add locale column headers with completion percentage
- [ ] T105 [UX] Add "Last saved" timestamp display in header
- [ ] T106 [UX] Ensure all new components have translated aria-labels

### Verification for Enhanced UX

- [ ] T107 [UX] Run web tests with `just test` and verify all pass
- [ ] T108 [UX] Run `just ready` to verify format, lint, typecheck, tests, and build all pass
- [ ] T109 [UX] Manually test unsaved changes warning by attempting navigation
- [ ] T110 [UX] Manually test keyboard navigation (Tab through cells)
- [ ] T111 [UX] Manually test copy-paste between cells

**Checkpoint**: Enhanced UX features complete - editor is now power-user friendly

---

## Phase 6: Performance and Scale

**Purpose**: Optimize for large projects with 1000+ strings

### Tests for Performance ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T112 [P] [Perf] Write performance test for rendering 1000 strings in `web/src/projects/components/bulk-editor/__tests__/performance.test.tsx`
- [ ] T113 [P] [Perf] Write test for virtual scrolling with 1000+ rows in `web/src/projects/components/bulk-editor/__tests__/virtualization.test.tsx`
- [ ] T114 [P] [Perf] Write server load test for bulk updating 500 strings in `server/src/strings/__tests__/bulk-update-performance.test.ts`

### Implementation for Performance

#### Virtualization

- [ ] T115 [P] [Perf] Create useVirtualization hook using @tanstack/react-virtual in `web/src/projects/hooks/use-virtualization.ts`
- [ ] T116 [Perf] Integrate virtualization into BulkEditorTable in `web/src/projects/components/bulk-editor/bulk-editor-table.tsx`
- [ ] T117 [Perf] Configure virtual scroller with proper row height and overscan
- [ ] T118 [Perf] Test scrolling performance with 1000+ strings

#### Optimizations

- [ ] T119 [P] [Perf] Add debounced validation (300ms) to cell editing in `web/src/projects/hooks/use-bulk-editor-validation.ts`
- [ ] T120 [P] [Perf] Implement optimistic updates for save operation in `web/src/projects/hooks/use-bulk-editor.ts`
- [ ] T121 [Perf] Use React.memo for BulkEditorCell to prevent unnecessary re-renders
- [ ] T122 [Perf] Use startTransition for non-urgent state updates (progress bar, dirty count)
- [ ] T123 [Perf] Add memoization for filtered strings computation in useBulkEditorFilters

#### Backend Optimizations

- [ ] T124 [P] [Perf] Add database index optimization for bulk queries if needed in `server/src/db/schema/strings.ts`
- [ ] T125 [P] [Perf] Add performance logging for bulk operations in `server/src/strings/routes/bulk-update.ts` using getLogger(c)
- [ ] T126 [Perf] Optimize transaction handling for large batch updates

#### Load Testing

- [ ] T127 [Perf] Create test data generator for 1000+ strings in `server/src/__tests__/test-data-generator.ts`
- [ ] T128 [Perf] Run load test: 1000 strings load time <3s
- [ ] T129 [Perf] Run load test: 500 strings bulk save time <5s
- [ ] T130 [Perf] Run load test: Smooth scrolling at 60fps with 1000 strings
- [ ] T131 [Perf] Profile and fix any performance bottlenecks

### Verification for Performance

- [ ] T132 [Perf] Run all tests with `just test` including performance tests
- [ ] T133 [Perf] Run `just ready` to verify format, lint, typecheck, tests, and build all pass
- [ ] T134 [Perf] Verify performance targets met: load <3s, save <5s, smooth scrolling
- [ ] T135 [Perf] Test with large project (5000 strings) and document performance

**Checkpoint**: Performance optimized - handles large projects smoothly

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, analytics, and production readiness

- [ ] T136 [P] [Polish] Add analytics events for bulk editor usage in `web/src/projects/components/bulk-editor/bulk-editor-page.tsx`
- [ ] T137 [P] [Polish] Add error logging with structured context in server route handlers using getLogger(c)
- [ ] T138 [P] [Polish] Add onboarding tooltip for first-time bulk editor users
- [ ] T139 [P] [Polish] Create user guide documentation in `specs/002-bulk-string-editor/user-guide.md`
- [ ] T140 [Polish] Review and improve all user-facing error messages
- [ ] T141 [Polish] Add loading skeletons for better perceived performance
- [ ] T142 [Polish] Ensure responsive design works on tablet (optional for MVP)
- [ ] T143 [Polish] Add feature flag for gradual rollout (optional)
- [ ] T144 [Polish] Update feature documentation in `specs/002-bulk-string-editor/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Backend (Phase 2)**: Depends on Setup completion
- **Frontend MVP (Phase 3)**: Depends on Backend completion (needs API endpoint)
- **Filtering (Phase 4)**: Depends on Frontend MVP completion
- **Enhanced UX (Phase 5)**: Depends on Frontend MVP completion (can overlap with Phase 4)
- **Performance (Phase 6)**: Depends on Frontend MVP completion (can work in parallel with Phase 4/5)
- **Polish (Phase 7)**: Depends on all previous phases

### Within Each Phase

1. **Tests FIRST** - Write all tests and ensure they FAIL before implementation
2. **Backend Work** - Repository → Routes → Router registration → OpenAPI docs
3. **Frontend Hooks** - Data fetching and state management
4. **Frontend Components** - UI implementation
5. **Styling** - CSS implementation
6. **Integration** - Wire components together
7. **Verification** - Run all tests and `just ready`

### Parallel Opportunities

#### Phase 1 (Setup) - T002-T005

- All 4 tasks can run in parallel (different files)

#### Phase 2 (Backend) Tests - T006-T011

- All 6 test files can be written in parallel (same file, different test cases)

#### Phase 2 (Backend) Implementation - T012-T013

- Schema and validation utility can be created in parallel (different files)

#### Phase 3 (Frontend) Tests - T027-T031

- All 5 test files can be written in parallel (different files)

#### Phase 3 (Frontend) Routing - T032-T034

- All 3 routing tasks can run in parallel (different files)

#### Phase 3 (Frontend) Hooks - T035-T038

- All 4 hooks/messages files can be created in parallel (different files)

#### Phase 3 (Frontend) Styling - T049-T052

- All 4 CSS files can be created in parallel (different files)

#### Phase 4 (Filters) Tests - T061-T064

- All 4 test cases can be written in parallel

#### Phase 4 (Filters) Implementation - T065-T066

- Messages and hook can be created in parallel

#### Phase 5 (UX) Tests - T080-T082

- All 3 test files can be written in parallel

#### Phase 5 (UX) Components - T083, T088, T094, T100

- useUnsavedChangesWarning, BulkEditorProgressBar, useKeyboardNavigation, and clipboard handlers can be created in parallel (different files)

#### Phase 6 (Performance) Tests - T112-T114

- All 3 performance test files can be written in parallel

#### Phase 6 (Performance) Optimizations - T115, T119-T120, T124-T125

- Virtualization hook, validation debouncing, optimistic updates, DB optimizations, and logging can be done in parallel

#### Phase 7 (Polish) - T136-T139, T141

- Analytics, logging, tooltip, documentation, and skeletons can all be done in parallel

---

## Implementation Strategy

### MVP First (Usable Feature)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Backend (T006-T026) - **CRITICAL GATE**
3. Complete Phase 3: Frontend MVP (T027-T060)
4. **STOP and VALIDATE**: Test end-to-end flow (open bulk editor → edit multiple strings → save all)
5. Deploy/demo if ready - users can now edit multiple strings efficiently

**MVP Delivery**: After Phase 1-3, you have a fully functional bulk editor that users can use to edit and save multiple strings at once.

### Incremental Delivery

1. **Setup + Backend** (T001-T026) → Backend API ready
2. **Add Frontend MVP** (T027-T060) → Test independently → Deploy/Demo ✓ **MVP!**
3. **Add Filtering** (T061-T079) → Test independently → Deploy/Demo ✓ Enhanced usability
4. **Add Enhanced UX** (T080-T111) → Test independently → Deploy/Demo ✓ Power-user features
5. **Add Performance** (T112-T135) → Test independently → Deploy/Demo ✓ Scales to large projects
6. **Polish** (T136-T144) → Final production-ready feature

Each phase adds value without breaking previous features.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup together** (T001-T005)
2. Once Setup is done:
   - **Developer A**: Backend work (T006-T026)
   - **Developer B**: Can start writing frontend tests (T027-T031) in parallel
3. Once Backend is complete:
   - **Developer B**: Frontend MVP (T032-T060)
   - **Developer C**: Can start on Filtering tests (T061-T064)
   - **Developer D**: Can start on Enhanced UX tests (T080-T082)
4. Once Frontend MVP is complete:
   - **Developer C**: Filtering implementation (T065-T079)
   - **Developer D**: Enhanced UX implementation (T083-T111)
   - **Developer E**: Performance work (T112-T135)

**Recommended Order for Single Developer**: Setup → Backend → Frontend MVP → Filtering → Performance → Enhanced UX → Polish

---

## Summary

- **Total Tasks**: 144
- **Setup**: 5 tasks (T001-T005)
- **Backend MVP**: 21 tasks (T006-T026)
- **Frontend MVP**: 34 tasks (T027-T060)
- **Filtering**: 19 tasks (T061-T079)
- **Enhanced UX**: 32 tasks (T080-T111)
- **Performance**: 24 tasks (T112-T135)
- **Polish**: 9 tasks (T136-T144)

### Parallel Opportunities Identified

- **Setup Phase**: 4 parallel tasks
- **Backend Phase**: 8 parallel opportunities
- **Frontend MVP Phase**: 16 parallel opportunities
- **Filtering Phase**: 6 parallel opportunities
- **Enhanced UX Phase**: 8 parallel opportunities
- **Performance Phase**: 7 parallel opportunities
- **Polish Phase**: 5 parallel opportunities

### Independent Test Criteria

- **Backend**: Bulk update multiple strings, handle conflicts, validate locales, return partial success
- **Frontend MVP**: Load strings in grid, edit multiple cells, save all changes, display conflicts
- **Filtering**: Filter by missing translations, filter by key pattern, filter by context
- **Enhanced UX**: Unsaved changes warning, keyboard navigation, progress tracking
- **Performance**: Load 1000 strings <3s, save 500 strings <5s, smooth scrolling

### Suggested Delivery Milestones

**Milestone 1 (MVP)**: Phase 1-3 complete

- Users can bulk edit and save multiple translations
- Estimated: 2-3 weeks

**Milestone 2 (Enhanced)**: Add Filtering (Phase 4)

- Users can filter to work on specific subsets
- Estimated: +1 week

**Milestone 3 (Power Users)**: Add Enhanced UX (Phase 5)

- Keyboard navigation, unsaved changes protection, progress tracking
- Estimated: +1 week

**Milestone 4 (Scale)**: Add Performance (Phase 6)

- Handles large projects with 1000+ strings
- Estimated: +1 week

**Milestone 5 (Production)**: Polish (Phase 7)

- Production-ready with analytics and documentation
- Estimated: +0.5 weeks

**Total Estimated Time**: 5.5-6.5 weeks to production-ready

---

## Format Validation ✅

All 144 tasks follow the required checklist format:

- ✓ Checkbox `- [ ]` at start
- ✓ Task ID (T001-T144) in sequence
- ✓ [P] marker for parallelizable tasks
- ✓ [Phase] label (Setup, MVP, Filters, UX, Perf, Polish) for phase tracking
- ✅ Clear descriptions with exact file paths
- ✅ Dependencies noted where applicable

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Phase] label maps task to implementation phase for tracking
- Each phase should be independently completable and testable
- **TDD MANDATORY**: Verify tests fail before implementing (Constitution Principle II)
- **CRITICAL**: Run `just ready` after each phase completion - NON-NEGOTIABLE
- Commit after each task or logical group
- Stop at any checkpoint to validate phase independently
- No ESLint suppressions allowed - fix underlying issues
- No `any` types - use proper typing with `unknown` and type guards
- All text must be translatable using react-intl
- NEVER use nullish coalescing (??) when values are guaranteed to exist - use `assert` instead
- ALWAYS verify work with relevant commands BEFORE claiming completion

---

## Risk Mitigation Checklist

- [ ] Virtualization implemented from start to handle scale
- [ ] Conflict detection thoroughly tested with multiple scenarios
- [ ] Unsaved changes warning prevents data loss
- [ ] Rate limiting prevents API abuse
- [ ] Transaction ensures atomic updates (all or nothing per string)
- [ ] Performance tested with 1000+ strings before general release
- [ ] Clear error messages guide users through issues
- [ ] Rollback plan documented and tested

---

## Success Criteria

After completing all tasks:

1. ✅ Users can view all project strings in spreadsheet-like grid
2. ✅ Users can edit multiple strings and locales simultaneously
3. ✅ Users can save all changes in one operation
4. ✅ Conflicts are detected and displayed clearly
5. ✅ Users can filter strings by various criteria
6. ✅ Keyboard navigation works smoothly
7. ✅ Unsaved changes are protected from accidental loss
8. ✅ Editor loads 1000 strings in <3 seconds
9. ✅ Bulk save of 500 strings completes in <5 seconds
10. ✅ All tests pass with `just ready`

**Definition of Done**: Feature is production-ready, tested, documented, and performing within targets.
