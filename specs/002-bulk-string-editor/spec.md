# Feature Specification: Bulk String Editor

**Feature Branch**: `002-bulk-string-editor`  
**Created**: February 15, 2026  
**Status**: Draft  
**Input**: User description: "bulk string editor"

## Problem Statement

The current translation workflow requires users to edit strings one at a time. When managing multiple translations across multiple locales, this becomes inefficient and time-consuming. Translators need to:

- Navigate to each string individually
- Open an edit form or expand accordion
- Make changes
- Save
- Repeat for next string

This process becomes especially tedious when:

- Adding translations for a new locale across all existing strings
- Updating terminology consistently across multiple strings
- Reviewing and editing a batch of related translations
- Making bulk corrections or improvements

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Batch Translation Entry (Priority: P1)

A translator opens the bulk editor view and sees all project strings displayed in a table format showing string keys and all enabled locales as columns. They can edit any translation field directly in the table and save all changes with a single action.

**Why this priority**: This is the core value proposition - enabling multi-string editing in one view. Without this, the feature provides no benefit over the existing editor.

**Independent Test**: Can be fully tested by opening the bulk editor, editing multiple translation fields across different strings and locales, clicking save once, and verifying all changes persist.

**Acceptance Scenarios**:

1. **Given** a project with 50 strings and 3 enabled locales, **When** the user opens the bulk editor, **Then** all strings are displayed in a table with columns for string key and each locale
2. **Given** the bulk editor is open, **When** the user clicks on any translation cell, **Then** the cell becomes editable with a text input
3. **Given** the user has edited 10 different translation fields, **When** they click the save button, **Then** all 10 changes are persisted to draft and the user sees a success confirmation
4. **Given** the user has saved changes to draft, **When** they click the publish button, **Then** a new version is created and the user sees a publish confirmation
5. **Given** the user is editing a cell, **When** they press Tab, **Then** focus moves to the next cell; Shift+Tab moves to previous cell; Enter starts/finishes editing
6. **Given** the user has unsaved changes, **When** they attempt to navigate away, **Then** the system prompts them to save or discard changes

---

### User Story 2 - Empty Translation Identification (Priority: P2)

A translator needs to complete missing translations for a specific locale. The bulk editor visually distinguishes empty/missing translations from completed ones, allowing quick identification of work that needs to be done.

**Why this priority**: Improves translator efficiency by making it obvious which translations need attention, but the basic editing functionality (P1) works without this.

**Independent Test**: Can be fully tested by creating a project with some strings having empty translations, opening the bulk editor, and verifying that empty cells are visually distinct (different background color, border, or indicator).

**Acceptance Scenarios**:

1. **Given** a project with some strings missing translations in certain locales, **When** the user opens the bulk editor, **Then** empty translation cells are visually distinguished with a distinct background color or border
2. **Given** the bulk editor is showing strings with mixed completion status, **When** the user scans the table, **Then** they can immediately identify which translations need to be added

---

### User Story 3 - Search and Filter Strings (Priority: P3)

A translator working on a specific subset of strings (such as error messages or navigation labels) can filter the bulk editor to show only matching strings by key or content.

**Why this priority**: Enhances usability for large projects but not essential for basic bulk editing. Users can still scroll through all strings.

**Independent Test**: Can be fully tested by opening a project with 100+ strings, entering a search term in the filter field, and verifying only matching strings remain visible in the table.

**Acceptance Scenarios**:

1. **Given** a project with 200 strings, **When** the user enters a search term in the filter field, **Then** only strings whose key or any translation content matches the term remain visible
2. **Given** the user has applied a filter, **When** they clear the filter, **Then** all strings become visible again
3. **Given** the user has edited strings, applied a filter, and edited additional strings, **When** they save, **Then** all modified strings (both filtered and unfiltered) are persisted to draft

---

### User Story 4 - Column Visibility Control (Priority: P3)

A translator working primarily with one or two locales can hide columns for locales they're not currently working with to reduce visual clutter and make the table easier to navigate.

**Why this priority**: Nice-to-have feature for large multi-locale projects, but users can work with all columns visible.

**Independent Test**: Can be fully tested by opening a project with 5+ locales, toggling column visibility controls to hide 3 locales, and verifying those columns are hidden while others remain visible.

**Acceptance Scenarios**:

1. **Given** a project with 5 enabled locales, **When** the user opens column visibility settings, **Then** they see checkboxes for each locale column
2. **Given** the user unchecks 2 locale checkboxes, **When** they apply the settings, **Then** those 2 locale columns are hidden from the table
3. **Given** the user has hidden certain columns, **When** they edit and save strings, **Then** hidden locales are not affected and retain their existing values

---

### User Story 5 - String Creation (Priority: P2)

A translator needs to add a new string key to the project. They can click an "Add String" button which inserts an editable row at the top of the table where they enter the string key, optional context, and translations for each locale inline.

**Why this priority**: Enables complete string management without leaving the bulk editor, improving workflow efficiency. Less critical than batch editing (P1) but more important than visual enhancements.

**Independent Test**: Can be fully tested by opening the bulk editor, clicking "Add String", entering a new key and translations, saving, and verifying the string appears in the project and persists after refresh.

**Acceptance Scenarios**:

1. **Given** the bulk editor is open, **When** the user clicks the "Add String" button, **Then** a new editable row appears at the top of the table with empty fields for key, context, and all enabled locales
2. **Given** the user has entered a new string key and at least one translation, **When** they click save, **Then** the new string is created using the existing upsert API
3. **Given** the user tries to create a string with a key that already exists, **When** they attempt to save, **Then** the system shows a validation error indicating the key must be unique
4. **Given** the user has started entering a new string, **When** they click cancel or press Escape, **Then** the new row is removed and no data is saved
5. **Given** the user creates a new string, **When** they save successfully, **Then** the new string appears in the table with all other strings and can be edited like any existing string

---

### User Story 6 - String Deletion (Priority: P2)

A translator needs to remove obsolete or incorrect strings from the project. Each table row has a delete action that, when clicked, immediately removes the string with an undo toast notification in case of accidental deletion.

**Why this priority**: Completes the CRUD lifecycle for strings within the bulk editor. Pairs naturally with creation (US5) to enable full string management.

**Independent Test**: Can be fully tested by opening the bulk editor, clicking the delete icon on a string, verifying it disappears immediately, clicking undo if needed, and confirming the deletion persists after page refresh if undo was not used.

**Acceptance Scenarios**:

1. **Given** the bulk editor is displaying strings, **When** the user clicks the delete icon on any row, **Then** the string is immediately removed from the table and a toast notification appears with an "Undo" option
2. **Given** a string has been deleted with the undo toast visible, **When** the user clicks "Undo" within the toast timeout period, **Then** the string is restored to the table
3. **Given** a string has been deleted and the undo period has expired, **When** the user refreshes the page, **Then** the string does not appear (deletion persisted)
4. **Given** a string has been deleted, **When** the delete operation completes successfully, **Then** the string and all its translations are removed from the database via cascade delete
5. **Given** a user has unsaved edits to a string, **When** they delete that string, **Then** the unsaved edits are discarded and the string is deleted
6. **Given** a delete operation fails due to network error, **When** the error occurs, **Then** the string is automatically restored to the table and an error toast is shown

---

### Edge Cases

- What happens when a user edits a translation that another user has modified since the page loaded? System uses last-write-wins per translation field, so each locale value is overwritten independently by the most recent save.
- What happens when the project has 1000+ strings? System should use virtual scrolling to render only visible rows, maintaining smooth performance regardless of total string count.
- What happens when a very long translation is entered? Cell should expand vertically or provide a larger editing textarea for lengthy content.
- What happens when network fails during save? System should retain unsaved changes in browser and allow retry when connection is restored.
- What happens when a user has edit permissions revoked while editing? System should detect permission change and prevent save with appropriate error message.
- What happens when a user creates a string with a duplicate key? System shows validation error and prevents the save operation until the key is made unique.
- What happens when a user deletes a string that has been published in snapshots? The string is removed from drafts but published snapshots remain immutable and unchanged.
- What happens when network fails during delete? The string is automatically restored to the table and an error toast is shown with option to retry.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display all project strings in a tabular format with string key as the first column
- **FR-002**: System MUST display a column for each enabled locale in the project showing current translation values
- **FR-003**: System MUST allow inline editing of any translation cell by clicking on it
- **FR-004**: System MUST track which translations have been modified since the view was opened
- **FR-005**: System MUST provide a save action that persists all modified translations to draft state in a single operation
- **FR-006**: System MUST provide a publish action that creates a new version from the current draft state
- **FR-007**: System MUST visually indicate unsaved changes to prevent accidental data loss
- **FR-008**: System MUST confirm successful save and display any errors that occurred
- **FR-009**: System MUST visually distinguish empty or missing translations from populated ones
- **FR-010**: System MUST prevent editing by users who lack appropriate project permissions
- **FR-011**: System MUST handle navigation away from the editor by prompting to save or discard unsaved changes
- **FR-012**: System MUST implement virtual scrolling to efficiently render and interact with projects containing hundreds or thousands of strings by only rendering visible rows
- **FR-013**: System MUST provide search/filter functionality to reduce visible strings based on key or content matching, while save operations persist all modified strings regardless of filter state
- **FR-014**: System MUST allow users to show or hide specific locale columns
- **FR-015**: System MUST preserve column visibility preferences within the current session
- **FR-016**: System MUST use last-write-wins conflict resolution at the translation field level, treating each locale value independently
- **FR-017**: System MUST support keyboard navigation using Tab/Shift+Tab to move between cells and Enter to start/finish editing a cell
- **FR-018**: System MUST allow users to create new strings by adding an editable row with fields for key, optional context, and all locale translations
- **FR-019**: System MUST validate that new string keys are unique within the project and non-empty before allowing save
- **FR-020**: System MUST provide a delete action for each string that removes the string and all its translations from the database
- **FR-021**: System MUST implement optimistic UI updates for delete operations with automatic restoration on API failure
- **FR-022**: System MUST provide an undo mechanism for string deletion with a time-limited toast notification
- **FR-023**: System MUST discard any unsaved edits to a string when that string is deleted

### Key Entities _(include if feature involves data)_

- **Project String**: Represents a translatable string with a unique key within a project
- **Translation**: A locale-specific translation value for a project string, can be empty or populated
- **Locale**: A language/region combination enabled for the project, displayed as a column
- **Edit Session**: Tracks the set of translation modifications made in a single bulk editor session before saving

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Translators can edit and save 20 translations across 3 locales in under 2 minutes, compared to 5+ minutes with the single-string editor
- **SC-002**: The bulk editor loads and renders projects with 500 strings across 5 locales within 3 seconds
- **SC-003**: 90% of bulk editor save operations complete successfully within 2 seconds
- **SC-004**: Zero data loss events when users have unsaved changes and attempt to navigate away
- **SC-005**: Translators report reduced time spent on batch translation tasks by at least 60%

## Clarifications

### Session 2026-02-15

- Q: How does the bulk editor integrate with the versioning system? → A: Save creates/updates draft; publish creates new version
- Q: How should the system handle rendering large numbers of strings for performance? → A: Virtual scrolling (render only visible rows)
- Q: How should concurrent edits to the same translation be resolved? → A: Last-write-wins per translation field
- Q: When a filter is active, what strings should be saved? → A: Always saves all modified strings regardless of current filter state
- Q: What keyboard navigation pattern should be supported? → A: Tab/Shift+Tab between cells, Enter to edit/save

## Assumptions

- Users have projects with at least 10 strings where bulk editing provides noticeable benefit
- Most projects have between 2-10 enabled locales
- Translation values are typically short to medium length text (under 500 characters)
- Standard web table/grid interactions are familiar to users (clicking cells to edit, spreadsheet-style keyboard navigation with Tab/Enter)
- Users work on desktop or laptop devices with sufficient screen real estate for table display
- Network latency for save operations is reasonable (under 1 second for typical payloads)
- The project uses a draft/publish workflow where draft changes are not visible to consuming applications until explicitly published
