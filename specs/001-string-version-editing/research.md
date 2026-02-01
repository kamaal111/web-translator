# Research: String Version History & Editing

**Feature**: String Version History & Editing  
**Date**: February 1, 2026  
**Phase**: 0 - Outline & Research

## Research Questions

This document captures decisions, rationale, and alternatives considered for implementing version history viewing and draft editing.

## 1. Database Query Patterns for Version History

**Research Question**: How should we efficiently query version history (all snapshots + draft) for a given string across potentially thousands of versions?

**Decision**: Use separate queries with proper indexing:

1. Query `translationSnapshots` table filtered by `projectId` and `stringId` (via join through `strings` table)
2. Query `strings` table to get the current draft
3. Combine results in application layer

**Rationale**:

- Existing index `translation_snapshots_project_locale_idx` supports efficient snapshot retrieval
- `strings` table has `strings_project_id_idx` for efficient draft lookup
- Separate queries avoid complex joins and are easier to cache
- Translation snapshots are immutable, enabling aggressive caching
- Performance target of <2 seconds easily achievable with indexed queries

**Alternatives Considered**:

- **Single UNION query**: Rejected because `translationSnapshots` uses JSONB blob structure while `strings`/`translations` use relational structure, making union complex and error-prone
- **Recursive CTE**: Rejected as unnecessary complexity; snapshots are not hierarchical
- **Full table scan**: Rejected due to performance concerns at scale (10k+ snapshots)

**Database Schema Insight**:

- The `translationSnapshots.data` field is JSONB storing `{ key: value }` pairs for all translations in that snapshot
- To get version history for a specific string key, we need to:
  1. Find all snapshots for a project+locale
  2. Extract the value for the specific key from each snapshot's JSONB data
  3. Join with draft from `strings`/`translations` tables

## 2. UI Component Structure for Expandable Version Lists

**Research Question**: What's the best pattern for displaying expandable/collapsible string rows with version history in React?

**Decision**: Use Radix UI Accordion component with custom styling

**Rationale**:

- Radix UI Accordion provides accessible expand/collapse behavior out of the box
- Handles keyboard navigation (arrow keys, home/end) automatically
- ARIA attributes for screen readers built-in
- Matches existing UI library (Radix UI Themes) used throughout the project
- Supports controlled/uncontrolled modes for flexibility

**Alternatives Considered**:

- **Custom disclosure component**: Rejected because would require reimplementing accessibility features and keyboard navigation
- **HTML `<details>/<summary>`**: Rejected due to limited styling flexibility and inconsistent browser behavior
- **React state + CSS transitions**: Rejected because Radix provides better animation and accessibility

**Implementation Pattern**:

```tsx
<Accordion.Root type="multiple">
  {strings.map(string => (
    <Accordion.Item value={string.id} key={string.id}>
      <Accordion.Trigger>
        {string.key} <VersionIndicator count={string.snapshotCount} />
      </Accordion.Trigger>
      <Accordion.Content>
        <VersionHistory stringId={string.id} />
      </Accordion.Content>
    </Accordion.Item>
  ))}
</Accordion.Root>
```

## 3. Draft Editing with Optimistic Updates

**Research Question**: Should draft edits use optimistic updates or wait for server confirmation?

**Decision**: Use pessimistic updates with loading state (wait for server confirmation)

**Rationale**:

- Guarantees zero data loss (Success Criteria SC-004)
- Allows server-side validation before persisting
- Enables last-write-wins conflict detection on server
- Prevents confusing UI state when edits fail
- Acceptable UX since edit completion target is <30 seconds (SC-003)

**Alternatives Considered**:

- **Optimistic updates**: Rejected because rollback complexity when edits fail, especially with concurrent editing warnings
- **Auto-save with debouncing**: Considered for future enhancement but not initial implementation; adds complexity for conflict resolution
- **WebSocket for real-time updates**: Rejected as over-engineering for MVP; HTTP polling sufficient for conflict detection

**API Design**:

```
PATCH /app-api/v1/projects/:projectId/strings/:stringId/draft
Body: { translations: { locale: value } }
Response: { draft: {...}, lastModifiedBy: {...}, lastModifiedAt: "..." }
Headers: X-Last-Modified-By (for conflict detection)
```

## 4. Version Comparison UI Pattern (P3)

**Research Question**: How should side-by-side version comparison highlight differences?

**Decision**: Use `diff` library with inline highlighting

**Rationale**:

- Industry standard pattern (Git diffs, Google Docs version history)
- `diff` library is mature, well-tested, and lightweight
- Supports word-level and character-level diffs
- Can highlight additions (green), deletions (red), unchanged (gray)

**Alternatives Considered**:

- **Custom diff algorithm**: Rejected due to complexity and potential bugs
- **Line-by-line comparison without highlighting**: Rejected because makes changes harder to spot
- **Three-way diff**: Rejected as unnecessary for two-version comparison

**Implementation Note**: This is P3 priority, so will be documented in contracts but implementation can be deferred.

## 5. Handling Large Version Histories (10k+ snapshots)

**Research Question**: How to maintain performance when displaying projects with thousands of snapshots?

**Decision**: Implement pagination for version history display

**Rationale**:

- Target is to support 10k+ snapshots (SC-006)
- Rendering 10k DOM elements would cause severe performance degradation
- Pagination keeps initial render fast (<2 seconds, SC-001)
- Users typically care most about recent versions (reverse chronological order)

**Implementation**:

- Default page size: 20 versions per page
- Load more button or infinite scroll for additional versions
- Draft always shown at top regardless of pagination

**Alternatives Considered**:

- **Virtual scrolling**: Rejected because pagination is simpler and more predictable for users
- **Load all versions**: Rejected due to performance concerns (10k DOM nodes)
- **Aggressive filtering (e.g., only last 100)**: Rejected because audit requirement means all history must be accessible

## 6. Concurrent Editing Conflict Resolution

**Research Question**: How to implement last-write-wins with warning for concurrent edits?

**Decision**: Use `lastModifiedAt` timestamp comparison on server

**Rationale**:

- Simple to implement and understand
- No distributed locking complexity
- Warning threshold: 5 minutes (if another user saved within 5 minutes, show warning)
- User can proceed anyway (last-write-wins)

**Implementation**:

```
1. Client fetches draft with lastModifiedAt timestamp
2. User edits and submits PATCH with If-Unmodified-Since header
3. Server checks if lastModifiedAt > If-Unmodified-Since + 5 minutes
4. If yes, return 409 Conflict with warning message
5. Client shows warning, user can retry with force flag
6. On force=true, server saves regardless
```

**Alternatives Considered**:

- **Optimistic locking with version field**: Rejected because timestamp is more intuitive for "recently modified" detection
- **Pessimistic locking**: Rejected because locks can be orphaned if client crashes
- **CRDTs**: Rejected as over-engineering for simple key-value editing

## Summary

All research questions resolved. No blocking unknowns remain. Key patterns established:

- Database queries use existing indexes for efficient version retrieval
- UI uses Radix Accordion for accessible expand/collapse
- Draft editing uses pessimistic updates with server validation
- Pagination handles large version histories
- Simple timestamp-based conflict detection for concurrent edits
