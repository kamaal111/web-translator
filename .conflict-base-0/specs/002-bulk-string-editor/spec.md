# Feature Specification: Bulk String Editor

**Status**: Draft | **Priority**: P1 | **Created**: February 8, 2026

---

## Problem Statement

### Current Limitations

1. **Single-locale creation**: Users can only add translations for the default locale when creating a new string. Other locales must be added separately later.
2. **One-string-at-a-time editing**: The current draft editor (including the bulk locale editor from Phase 6.5) only allows editing one string at a time, requiring users to:
   - Expand a string in the accordion
   - Edit its translations
   - Save
   - Repeat for the next string
3. **Inefficient workflow for bulk updates**: When working on multiple strings across multiple locales (e.g., translating 20 new strings into 5 languages), users must make 100+ individual save operations.

### User Pain Points

- **Translators** spend excessive time navigating between individual strings when working on a batch of translations
- **Content managers** updating many strings (e.g., seasonal messaging, rebranding) face repetitive UI interactions
- **New locales** requiring translation of all existing strings become a tedious multi-hour task
- **Context loss** when jumping between strings - translators lose the "flow" of translation work

---

## Proposed Solution

A **dedicated bulk editor view** that presents all project strings in a long-form table/spreadsheet-like interface, allowing users to:

1. View and edit **all strings** and **all locales** simultaneously in one view
2. Make changes to any number of strings/locales
3. **Save all changes in a single operation** when ready
4. Optionally filter/search to work on a subset of strings

---

## User Stories

### US1: Bulk Translation Entry (Priority: P1)

**As a translator**, I want to see all strings for a specific locale in one view so I can translate many strings efficiently without losing context.

**Acceptance Criteria:**

- AC1: I can view all project strings in a table with columns for each enabled locale
- AC2: I can edit any translation field directly in the table
- AC3: I can see which translations are missing (empty/draft)
- AC4: I can save all my changes at once with a single "Save" action
- AC5: Unsaved changes are clearly indicated (dirty state)

### US2: Filtered Bulk Editing (Priority: P2)

**As a content manager**, I want to filter strings by criteria (missing translations, context, key pattern) so I can work on specific subsets efficiently.

**Acceptance Criteria:**

- AC1: I can filter strings by "missing translations for locale X"
- AC2: I can filter strings by key pattern (e.g., "HOME.\*")
- AC3: I can filter strings by context value
- AC4: Filters persist during editing session
- AC5: Filter status shows count of matching strings

### US3: Validation and Error Handling (Priority: P1)

**As a translator**, I want clear validation feedback so I know which fields have errors before saving.

**Acceptance Criteria:**

- AC1: Empty required translations are highlighted before save
- AC2: Invalid locale codes are rejected
- AC3: Conflict detection warns me if strings were modified by others
- AC4: I can see which specific cells have errors
- AC5: I can fix errors and retry save without losing other changes

### US4: Progress Tracking (Priority: P2)

**As a project manager**, I want to see translation completion status so I can track progress across locales.

**Acceptance Criteria:**

- AC1: I can see percentage complete per locale
- AC2: I can see count of missing translations per locale
- AC3: Progress updates in real-time as I fill in translations
- AC4: I can export completion report

---

## Success Criteria

### Functional Requirements

| ID     | Requirement                                                                            | Priority |
| ------ | -------------------------------------------------------------------------------------- | -------- |
| FR-001 | Users MUST be able to view all strings and all locales in a single editable grid/table | P1       |
| FR-002 | Users MUST be able to edit any translation field directly in-place                     | P1       |
| FR-003 | Users MUST be able to save all changes in a single atomic operation                    | P1       |
| FR-004 | System MUST validate all changes before saving (no empty required fields)              | P1       |
| FR-005 | System MUST detect conflicts if strings were modified by others since load             | P1       |
| FR-006 | Users SHOULD be able to filter strings by missing translations                         | P2       |
| FR-007 | Users SHOULD be able to filter strings by key pattern or context                       | P2       |
| FR-008 | Users SHOULD see visual indication of unsaved changes                                  | P2       |
| FR-009 | Users SHOULD see translation completion progress per locale                            | P2       |
| FR-010 | Users COULD export/import translations as CSV for offline editing                      | P3       |

### Performance Targets

| ID     | Target                                               | Rationale                    |
| ------ | ---------------------------------------------------- | ---------------------------- |
| SC-001 | Load bulk editor with 1000 strings in <3 seconds     | Typical medium-sized project |
| SC-002 | Render table with 50 strings × 5 locales without lag | Smooth scrolling UX          |
| SC-003 | Save 100 translation changes in <5 seconds           | Batch save operation         |
| SC-004 | Search/filter results appear in <500ms               | Instant feedback             |
| SC-005 | Support projects with up to 5000 strings             | Enterprise scale             |

### User Experience Targets

| ID     | Target                                    | Rationale                              |
| ------ | ----------------------------------------- | -------------------------------------- |
| UX-001 | Zero data loss on accidental navigation   | Auto-save draft or confirmation dialog |
| UX-002 | Keyboard navigation between cells         | Spreadsheet-like efficiency            |
| UX-003 | Copy-paste between cells works seamlessly | Translator workflow                    |
| UX-004 | Undo/redo support for edits               | Error recovery                         |

---

## Technical Approach

### UI Design Options

#### Option A: Spreadsheet-like Grid (Recommended)

- **Layout**: Horizontal scrolling table with fixed string key column
- **Columns**: `String Key`, `Context`, `en`, `es`, `fr`, ... (one column per locale)
- **Advantages**:
  - Familiar spreadsheet paradigm
  - Easy to scan horizontally across locales
  - Can leverage existing grid libraries (e.g., AG Grid, TanStack Table)
- **Disadvantages**:
  - Horizontal scrolling for many locales
  - May not scale well beyond 10 locales

#### Option B: Card-based Long Form

- **Layout**: Vertical list of cards, one per string
- **Each card**: Shows all locale translations as labeled textareas
- **Advantages**:
  - Scales to many locales without horizontal scroll
  - More space per translation field
  - Mobile-friendly
- **Disadvantages**:
  - More vertical scrolling
  - Harder to compare translations across strings

#### Option C: Locale-first View

- **Layout**: Single locale view with all strings
- **Toggle**: Dropdown to switch between locales
- **Advantages**:
  - Focused translation workflow
  - Simpler UI
- **Disadvantages**:
  - Can't see multiple locales simultaneously
  - More clicks to translate across locales

**Recommendation**: Start with **Option A (Grid)** for power users, potentially add **Option C** as an alternative "focused mode" in later iteration.

### Backend Implementation

#### New Endpoints

1. **Bulk Update Endpoint**

   ```
   PATCH /app-api/v1/p/:projectId/strings/bulk
   Body: {
     updates: Array<{
       stringKey: string;
       translations: Record<locale, value>;
       ifUnmodifiedSince?: Date;
     }>
   }
   Response: {
     updated: Array<UpdatedTranslation>;
     conflicts: Array<ConflictInfo>;
     errors: Array<ValidationError>;
   }
   ```

2. **Existing endpoint can be reused for loading:**
   - `GET /app-api/v1/s/:projectId` already returns all strings with translations

#### Data Loading Strategy

- **Initial load**: Fetch all strings for project (existing endpoint)
- **Pagination**: Consider virtual scrolling for 1000+ strings
- **Optimistic updates**: Update UI immediately, sync to server on save
- **Conflict resolution**: Compare `updatedAt` timestamps server-side

#### Validation Rules

- All enabled locales should have non-empty values (warn if missing)
- Translations must not exceed max length (if applicable)
- String keys are immutable (display only)
- Detect concurrent modifications using `ifUnmodifiedSince`

### Frontend Implementation

#### State Management

```typescript
interface BulkEditorState {
  // Original data from server
  strings: StringResponse[];

  // User edits (locale -> value for each string)
  dirtyFields: Map<stringKey, Map<locale, string>>;

  // Validation errors
  errors: Map<stringKey, Map<locale, string>>;

  // Filters
  filters: {
    keyPattern?: string;
    missingLocale?: string;
    hasContext?: boolean;
  };

  // UI state
  isSaving: boolean;
  lastSaved?: Date;
}
```

#### Key Components

1. **BulkEditorTable** - Main grid component
2. **BulkEditorCell** - Editable cell with textarea
3. **BulkEditorFilters** - Filter controls sidebar
4. **BulkEditorProgressBar** - Translation completion indicator
5. **BulkEditorSaveButton** - Save all changes with conflict handling

#### Libraries to Consider

- **TanStack Table** (formerly React Table) - Headless table with virtualization
- **@radix-ui/react-scroll-area** - Custom scrolling
- **react-hook-form** - Form state management
- Or **AG Grid** if more advanced features needed (sorting, Excel export, etc.)

---

## User Interface Mockup (Text)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Project: My App                                    [← Back to Project]│
│ Bulk Translation Editor                                   [Save All] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Filters: [All Strings ▼] [All Locales ▼] [🔍 Search...]            │
│                                                                       │
│ Progress: en 100% | es 80% | fr 45% | de 20%                        │
│                                                                       │
├───────────────┬─────────────┬──────────────┬──────────────┬─────────┤
│ String Key    │ Context     │ en (100%)    │ es (80%)     │ fr (45%)│
├───────────────┼─────────────┼──────────────┼──────────────┼─────────┤
│ HOME.TITLE    │ Homepage    │ Welcome      │ Bienvenido   │ Bienvenu│
│               │ header      │              │              │         │
├───────────────┼─────────────┼──────────────┼──────────────┼─────────┤
│ HOME.SUBTITLE │ null        │ Get started  │ Empezar      │ [empty] │
│               │             │              │              │  ⚠️      │
├───────────────┼─────────────┼──────────────┼──────────────┼─────────┤
│ AUTH.LOGIN    │ Login page  │ Sign In      │ Iniciar      │ [empty] │
│               │             │              │  sesión      │  ⚠️      │
└───────────────┴─────────────┴──────────────┴──────────────┴─────────┘

Unsaved changes: 5 strings modified • Last saved: 2 minutes ago
```

---

## Implementation Phases

### Phase 1: Core Bulk Editor (MVP)

**Goal**: Basic grid view with edit and save functionality

**Tasks:**

- [ ] Create bulk editor route and page
- [ ] Implement grid UI with fixed columns (string key, context, locale columns)
- [ ] Hook up to existing `GET /strings/:projectId` endpoint
- [ ] Implement in-place editing for translation cells
- [ ] Track dirty state for edited cells
- [ ] Create new bulk update endpoint: `PATCH /strings/:projectId/bulk`
- [ ] Implement save all with validation
- [ ] Add loading/saving states
- [ ] Add basic error handling

**Success Metric**: Users can edit and save multiple strings across multiple locales in one operation

### Phase 2: Filtering and Search

**Goal**: Help users find and work on specific subsets of strings

**Tasks:**

- [ ] Add filter by missing translations
- [ ] Add search by string key
- [ ] Add filter by context
- [ ] Show filtered results count
- [ ] Persist filters in URL params

**Success Metric**: Users can filter to work on incomplete translations efficiently

### Phase 3: Enhanced UX

**Goal**: Improve usability with keyboard shortcuts, progress tracking, and safety features

**Tasks:**

- [ ] Add keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Add copy-paste support
- [ ] Add translation progress indicators
- [ ] Add unsaved changes warning on navigation
- [ ] Add undo/redo support
- [ ] Add auto-save draft (optional)

**Success Metric**: Power users can navigate and edit efficiently with keyboard

### Phase 4: Performance and Scale

**Goal**: Handle large projects smoothly

**Tasks:**

- [ ] Implement virtual scrolling for 1000+ strings
- [ ] Optimize render performance
- [ ] Add pagination or infinite scroll
- [ ] Add backend query optimization
- [ ] Load testing with 5000 strings

**Success Metric**: Editor loads and performs smoothly with 1000+ strings

---

## Open Questions

1. **Conflict Resolution Strategy**: If multiple users edit different strings in bulk editor simultaneously, should we:
   - Allow per-string conflict detection (only fail conflicting strings)? ✓ Recommended
   - Fail entire save if any string conflicts?
   - Show conflicts and let user resolve before retrying?

2. **Empty Translations**: Should empty translations be:
   - Allowed (user can save partial work)? ✓ Recommended - show warnings
   - Blocked (must fill all fields)?
   - Configurable per project?

3. **Locale Column Order**: Should locale columns be:
   - Fixed order (alphabetical)?
   - User-defined order (drag to reorder)? ✓ Nice to have
   - Most-used locales first?

4. **Navigation**: Should bulk editor be:
   - Separate page/route? ✓ Recommended
   - Modal/overlay on project page?
   - Tab within project page?

5. **Mobile Support**: Should bulk editor be:
   - Desktop-only (redirect mobile to regular editor)? ✓ Initial approach
   - Responsive with mobile-optimized view?
   - PWA with offline support?

---

## Out of Scope (Future Enhancements)

- CSV/Excel import/export for offline translation
- Machine translation integration
- Translation memory suggestions
- Collaborative real-time editing (multiple users)
- Translation comments/notes
- String approval workflow
- Version history in bulk view
- Diff view between draft and published

---

## Security Considerations

- Bulk update must respect project access controls (same as single update)
- Rate limiting on bulk endpoint to prevent abuse
- Validate max number of strings per bulk update (e.g., 500 limit)
- Audit log bulk operations with user ID and timestamp

---

## Migration/Rollout Plan

1. **Week 1**: Implement Phase 1 (MVP) behind feature flag
2. **Week 2**: Internal testing and refinement
3. **Week 3**: Beta release to select users
4. **Week 4**: Polish based on feedback, implement Phase 2
5. **Week 5**: General release
6. **Week 6+**: Phase 3 and 4 based on usage metrics

---

## Success Metrics

### Quantitative

- 80% of multi-string edits use bulk editor (vs old method)
- Average time to translate 10 strings reduced by 60%
- Bulk save success rate >95%
- Editor load time <3s for 1000 strings

### Qualitative

- Positive user feedback on translator efficiency
- Reduced support tickets about translation workflow
- User survey rating >4/5 for bulk editor

---

## Approval

- [ ] Product Owner review and sign-off
- [ ] Technical Lead architecture review
- [ ] UX Designer mockup review
- [ ] Security team risk assessment

**Next Steps**: Upon approval, proceed with Phase 1 implementation planning and task breakdown.
