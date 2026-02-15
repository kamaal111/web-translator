# Research: Bulk String Editor

**Feature**: 002-bulk-string-editor
**Date**: 2026-02-15

## Research Tasks & Findings

### 1. Can existing APIs support bulk editing without new endpoints?

**Decision**: Yes — reuse existing endpoints for MVP.

**Rationale**: The existing `PUT /app-api/v1/s/:projectId/translations` endpoint already accepts an array of `{ key, context?, translations: Record<string, string> }` entries with no upper bound enforced in the schema (only `min(1)`). This handles the "save all modified translations" requirement directly. The `POST /app-api/v1/p/:projectId/publish` endpoint supports multi-locale publishing via `{ locales?: string[], force?: boolean }`.

**Alternatives considered**:

- New `PATCH /app-api/v1/p/:projectId/strings/bulk` endpoint: Rejected because the existing upsert endpoint already handles batch operations. A new endpoint would duplicate logic and require OpenAPI spec regeneration + client regeneration without adding capability.
- Per-cell auto-save with debounce: Rejected because it conflicts with the spec's "single save action" requirement (FR-005) and would generate excessive API traffic.

**Codebase evidence**:

- `server/src/strings/routes/upsert-translations.ts`: Takes `{ translations: TranslationEntry[] }`, validates, upserts all in batch
- `server/src/strings/repositories/strings/implementation.ts`: `upsertTranslations()` uses `onConflictDoUpdate` for atomic batch operations
- `server/src/projects/routes/publish-snapshot.ts`: Takes `{ locales?: string[], force?: boolean }`, publishes for all specified locales

### 2. Conflict resolution strategy

**Decision**: Last-write-wins per translation field (FR-016).

**Rationale**: The spec explicitly states "last-write-wins per translation field, treating each locale value independently." This is the simplest approach and avoids complex conflict detection UI. The existing `upsertTranslations` endpoint naturally supports this — it overwrites the `translations` table rows via `onConflictDoUpdate` on `[stringId, locale]`.

**Alternatives considered**:

- Optimistic concurrency with `ifUnmodifiedSince`: Rejected per spec decision. The `updateDraftTranslations` endpoint supports this pattern (used in the single-string `DraftEditor` component with 409 conflict handling), but the spec chose simplicity for bulk editing where many users are unlikely to edit the same string simultaneously.
- Full operational transform (OT/CRDT): Rejected — far too complex for this use case, suited for real-time collaborative editing.

### 3. Table library selection

**Decision**: TanStack Table v8 (headless) + TanStack Virtual v3.

**Rationale**: TanStack Table is headless (no styling opinions), works with any UI library (Radix UI Themes), supports column visibility, sorting, filtering, and virtual scrolling via companion TanStack Virtual package. It's free, actively maintained, and follows the same philosophy as TanStack Query already used in the project.

**Alternatives considered**:

- AG Grid: Feature-rich but commercial license required for advanced features. Overkill for this use case.
- `react-data-grid`: Good but less flexible styling integration with Radix UI Themes.
- Native HTML table: Insufficient for virtual scrolling and column management at scale.

**Integration notes**:

- `@tanstack/react-table` provides `useReactTable`, `flexRender`, column definitions
- `@tanstack/react-virtual` provides `useVirtualizer` for row virtualization
- Both are already used with React 19 and work with the existing Vite build pipeline

### 4. State management for dirty tracking

**Decision**: Local React state with `Map<string, Record<string, string>>` for tracking edits.

**Rationale**: The bulk editor needs to track which cells have been modified since page load. A `Map` keyed by string key, with values being `Record<locale, newValue>`, provides O(1) lookup for dirty checking and can be directly converted to the `upsertTranslations` request payload. React Hook Form is not ideal here because the form shape is dynamic (varies by number of strings and locales).

**Alternatives considered**:

- React Hook Form: Works well for static forms but awkward for dynamic grid shapes where rows/columns change based on project data. Field registration overhead for 1000+ cells.
- Zustand: More structured but adds a dependency. Local state with `useReducer` or `useState` + `Map` is sufficient and keeps the feature self-contained.
- Redux Toolkit: Too heavy for a single-feature state need.

**Implementation approach**:

```typescript
type DirtyEdits = Map<string, Record<string, string>>;
```

- On cell edit: `dirtyEdits.set(stringKey, { ...dirtyEdits.get(stringKey), [locale]: newValue })`
- On save: Convert `dirtyEdits` to `TranslationEntry[]` for the upsert API
- On save success: Clear `dirtyEdits`
- `isDirty`: `dirtyEdits.size > 0`
- `getDirtyCount`: `sum of all locale entries across all keys`

### 5. Navigation and routing

**Decision**: Separate page at `/projects/:id/bulk-editor`.

**Rationale**: A dedicated page provides full screen real estate for the table layout, clear URL-based navigation, and independent loading/error states. This matches the spec's assumption of "sufficient screen real estate for table display" and allows sharing the URL.

**Alternatives considered**:

- Tab within project page: Would constrain the table within the existing page layout and complicate state management.
- Modal overlay: Insufficient screen space for a spreadsheet-like interface.

**Implementation**:

- Add lazy-loaded route in `web/src/routing/router.tsx` under `LoginRequiredLayout`
- Add SPA route in `server/src/web/router.ts` WEB_ROUTES array
- Navigation link from project details page (button or link in header)

### 6. Virtual scrolling approach

**Decision**: Row-level virtualization with TanStack Virtual.

**Rationale**: For 1000+ strings, rendering all rows causes DOM bloat and lag. TanStack Virtual renders only visible rows plus overscan buffer (~20 visible + 10 overscan = ~30 DOM nodes regardless of total count). Column count (2–10 locales) is small enough that horizontal virtualization is unnecessary.

**Key implementation details**:

- Fixed row height estimate (~60px) for the virtualizer
- Overscan of 5–10 rows for smooth scrolling
- Container `ref` on the scrollable parent div
- Virtual rows translate to absolute positioning within the table body
- Column headers remain fixed (not virtualized)

### 7. Keyboard navigation pattern

**Decision**: Tab/Shift+Tab between cells, Enter to toggle edit mode (FR-017).

**Rationale**: Matches the spec's explicit requirement and standard spreadsheet conventions. Tab moves horizontally through locale columns, then wraps to the next row. Enter opens/closes the cell for editing.

**Implementation approach**:

- Each cell gets a `tabIndex` for natural Tab order
- `onKeyDown` handler on cells:
  - `Enter`: Toggle between display and edit mode
  - `Escape`: Cancel edit, revert to original value
  - `Tab`/`Shift+Tab`: Handled by browser's natural tab order (cells are already tabbable)

### 8. Unsaved changes warning

**Decision**: Use `react-router` `useBlocker` + `beforeunload` event.

**Rationale**: Two protection layers: `useBlocker` prevents in-app navigation when `isDirty` is true (shows confirmation dialog), and `beforeunload` prevents browser tab close/refresh.

**Codebase evidence**: The existing `DraftEditor` component doesn't implement navigation blocking (it saves per-cell). This will be new for the bulk editor.

### 9. Column visibility persistence

**Decision**: Session-level state (React state), no persistence across page reloads.

**Rationale**: The spec says "preserve column visibility preferences within the current session" (FR-015). React state is sufficient — no need for localStorage or server-side persistence. When the user navigates away and back, columns reset to all-visible.

### 10. Empty translation visual distinction

**Decision**: CSS-based visual indicator on empty cells.

**Rationale**: Empty cells get a distinct background color (e.g., subtle yellow/amber tint using Radix UI Themes color tokens) to make them immediately scannable. This satisfies FR-009 without requiring a filter mechanism (which is separate, FR-013).

**Implementation**: Conditional className on the cell based on whether the translation value is empty/undefined.

### 11. Search/filter implementation

**Decision**: Client-side filtering with URL search params.

**Rationale**: Since all strings are already loaded in memory (via `listStrings` API), client-side filtering is instantaneous. URL search params allow shareable filtered views. The filter applies to the TanStack Table's `globalFilter` property, which searches across string key and all translation values.

**Important**: Save must persist ALL dirty edits regardless of current filter state (FR-013). The dirty tracking `Map` is independent of the filter — the filter only controls which rows are visible in the table.

## Dependencies (New)

| Package                   | Version | Purpose                                          |
| ------------------------- | ------- | ------------------------------------------------ |
| `@tanstack/react-table`   | ^8.0.0  | Headless table with column visibility, filtering |
| `@tanstack/react-virtual` | ^3.0.0  | Row virtualization for 1000+ strings             |

Both are dev/runtime dependencies for the `web/` package only. No server-side dependencies needed.

## Risks Identified

| Risk                                                 | Mitigation                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| TanStack Table + Radix UI Themes styling integration | Prototype a small table early; TanStack Table is headless so any element can be used           |
| Virtual scrolling + keyboard navigation interaction  | Test Tab order with virtualized rows; may need custom focus management for off-screen rows     |
| Large payload on save (500+ modified translations)   | Existing upsert endpoint handles arbitrary array size; add client-side chunking only if needed |
| React 19 compatibility with TanStack Table           | Both libraries support React 19; verify during dev setup                                       |
