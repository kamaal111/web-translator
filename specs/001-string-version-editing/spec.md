# Feature Specification: String Version History & Editing

**Feature Branch**: `001-string-version-editing`  
**Created**: February 1, 2026  
**Status**: Draft  
**Input**: User description: "In the project page show all versions of string snapshots and allow the user to edit the unpublished strings"

## Clarifications

### Session 2026-02-01

- Q: Draft vs Snapshot Editing - The current spec mentions "editing unpublished strings," but based on your clarification, users actually edit the **draft** (strings table), not snapshots. Which behavior is correct? → A: Users edit the draft (strings table) only; all snapshots are immutable and read-only for reference
- Q: Draft Initialization on First Edit - When a user wants to edit a string that has snapshots but no draft yet exists in the strings table, how should the draft be created? → A: Every project has 1 strings model (the draft) that persists continuously; users edit this single draft and publish creates snapshots without recreating the draft
- Q: Version Comparison Scope - When users compare versions (User Story 3 - P3), which versions should be available for comparison? → A: Compare any two snapshots, or compare draft vs any snapshot
- Q: Display Organization in Project Page - When showing all strings with their version history in the project page, how should the information be organized? → A: List strings, expand each to show snapshots + draft with version indicators
- Q: Concurrent Editing Protection - The edge cases mention concurrent editing. How should the system handle when two users try to edit the same draft string simultaneously? → A: Last-write-wins with warning if another user saved recently

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Version History (Priority: P1)

Users need to see the complete history of changes to their project strings, including who made changes and when. This provides transparency and allows users to understand how strings evolved over time.

**Why this priority**: This is the foundation of the feature - users must be able to view versions before they can make informed editing decisions. Without version visibility, users can't understand what changed or decide what to edit.

**Independent Test**: Can be fully tested by creating multiple snapshots of a string and verifying that all versions are displayed in chronological order with author and timestamp information. Delivers immediate value by providing visibility into string evolution.

**Acceptance Scenarios**:

1. **Given** a project with multiple translation snapshots, **When** a user opens the project page, **Then** they see a list of all strings with expandable version indicators
2. **Given** a user views the string list, **When** they expand a specific string, **Then** they see the draft and all snapshots in reverse chronological order (newest first)
3. **Given** a string is expanded to show version history, **When** viewing the versions, **Then** each snapshot displays the timestamp, author, and content, with the draft clearly distinguished
4. **Given** a string with only a draft and no snapshots, **When** viewing version history, **Then** the user sees only the draft entry indicating no snapshots exist yet

---

### User Story 2 - Edit Draft Strings (Priority: P2)

Users need to modify the draft version of strings (strings table) to correct errors, improve translations, or update content before publishing a new snapshot.

**Why this priority**: Editing capability is essential but depends on being able to view and select the correct string first. This is the primary action users will take after reviewing version history to understand the current state.

**Independent Test**: Can be fully tested by modifying a draft string, saving changes, and verifying the draft persists correctly. Delivers value by allowing users to refine content before creating an immutable snapshot.

**Acceptance Scenarios**:

1. **Given** a draft string exists, **When** a user clicks the edit button, **Then** an editable text field appears with the current draft content
2. **Given** a user is editing a draft string, **When** they modify the content and save, **Then** the changes are persisted in the draft (strings table)
3. **Given** a user is editing a draft string, **When** they cancel without saving, **Then** the original draft content remains unchanged
4. **Given** a user is viewing a translation snapshot (published version), **When** they view the snapshot, **Then** the content is displayed as read-only with no edit functionality
5. **Given** a draft exists that differs from the latest snapshot, **When** viewing the string, **Then** the system clearly indicates which version is the draft and which are snapshots
6. **Given** a user saves draft changes, **When** another user modified the same draft recently, **Then** a warning is displayed before saving but the user can proceed (last-write-wins)

---

### User Story 3 - Compare Versions (Priority: P3)

Users need to compare different versions side-by-side to understand what changed between snapshots or between the current draft and any published snapshot.

**Why this priority**: This is a valuable enhancement that helps users make better editing decisions, but the feature is functional without it. Users can still view and edit the draft and review snapshots individually.

**Independent Test**: Can be fully tested by selecting any two snapshots (or draft vs a snapshot) and verifying they are displayed side-by-side with differences highlighted. Delivers value by making change identification faster and more accurate.

**Acceptance Scenarios**:

1. **Given** multiple snapshots exist, **When** a user selects any two snapshots for comparison, **Then** both versions are displayed side-by-side
2. **Given** a draft and snapshots exist, **When** a user selects the draft and any snapshot for comparison, **Then** both versions are displayed side-by-side showing what changed
3. **Given** two versions are being compared, **When** the display renders, **Then** differences between the versions are visually highlighted
4. **Given** a user is comparing versions, **When** they close the comparison view, **Then** they return to the normal version history view

---

### Edge Cases

- When two users edit the same draft simultaneously, last-write-wins with a warning displayed if another user saved within the last few minutes
- Strings with very long content (thousands of characters) must render and be editable without performance degradation
- Snapshots are immutable and cannot be deleted; if a project is deleted, all associated snapshots are retained for audit purposes
- Rapid successive edits to the draft are handled gracefully with debouncing or optimistic updates
- Draft content always displays the most recent saved state even when viewing historical snapshots
- When the draft differs from the latest snapshot, visual indicators clearly show unsaved changes exist

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display all translation snapshots (immutable published versions) for a project in the project page view
- **FR-002**: System MUST show version history for each string, including snapshot timestamp, author, and content
- **FR-003**: System MUST clearly distinguish between the current draft (strings table) and translation snapshots (published versions)
- **FR-004**: Users MUST be able to edit the content of the draft (strings table) only
- **FR-005**: Users MUST NOT be able to edit translation snapshots (published versions are immutable)
- **FR-006**: System MUST persist edits to the draft immediately upon save
- **FR-007**: System MUST display snapshots in reverse chronological order (newest first) by default
- **FR-008**: System MUST show who created each snapshot and who last modified the draft
- **FR-009**: System MUST allow users to cancel draft edits without saving changes
- **FR-010**: System MUST provide visual feedback indicating which strings have multiple snapshots (expandable version indicators)
- **FR-011**: System MUST maintain the complete snapshot history; snapshots are immutable and never deleted by editing
- **FR-012**: System MUST allow users to expand/collapse individual strings to show/hide version history
- **FR-013**: System MUST validate that edited draft content meets required format constraints
- **FR-014**: System MUST prevent data loss by validating draft edits before saving
- **FR-015**: System MUST display appropriate error messages when draft edit operations fail
- **FR-016**: System MUST warn users if they are about to overwrite recent changes made by another user (last-write-wins with warning)
- **FR-017**: System MUST display when the draft was last modified and by whom

### Key Entities _(include if feature involves data)_

- **Draft String (Strings Table)**: The persistent mutable working version of a string that users continuously edit. Each project has one strings model (the draft) that exists from creation. When users publish, a snapshot is created from the current draft state, but the draft continues to exist for further editing.
- **Translation Snapshot**: An immutable published version of a string created at a specific point in time when the user publishes the draft. Contains the string content, timestamp, author, and project association. Once created, cannot be modified.
- **Version History**: A chronologically ordered collection of all translation snapshots for a specific string identifier, showing the published evolution of that string over time. The current draft is shown separately as the working version.
- **Project Context**: The container that groups related strings and their snapshots, defining the scope of version history visibility

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view complete version history for any string in under 2 seconds
- **SC-002**: 95% of users successfully distinguish between the draft and published snapshots on first attempt
- **SC-003**: Users can complete an edit to a draft string in under 30 seconds
- **SC-004**: Zero data loss occurs when editing draft strings
- **SC-005**: System prevents 100% of attempts to edit translation snapshots (published versions)
- **SC-006**: Version history displays correctly for projects with up to 10,000 string snapshots
- **SC-007**: Users report 90% confidence in understanding string change history
