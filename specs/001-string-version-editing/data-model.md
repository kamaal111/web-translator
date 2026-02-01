# Data Model: String Version History & Editing

**Feature**: String Version History & Editing  
**Date**: February 1, 2026  
**Phase**: 1 - Design & Contracts

## Overview

This feature leverages existing database entities (`strings`, `translations`, `translationSnapshots`) without schema changes. This document describes the entities, their relationships, and state transitions relevant to version history and draft editing.

## Existing Entities

### Draft String (strings table)

The persistent, mutable working version of a string identifier. Each project has one strings model per string key that exists continuously from creation.

**Schema** (existing - no changes):

```typescript
{
  id: text (PK),
  key: text (NOT NULL),              // e.g., "HOME.TITLE"
  context: text (nullable),          // Optional description of usage
  projectId: text (FK -> projects),
  createdAt: timestamp,
  createdBy: text (FK -> users),
  updatedAt: timestamp,
  updatedBy: text (FK -> users)
}
```

**Constraints**:

- Unique (key, projectId)
- key must not be empty (CHECK)
- Index on projectId

**Relationships**:

- Belongs to one Project
- Has many Translations (draft versions)
- Referenced by TranslationSnapshots through key matching

### Draft Translation (translations table)

The actual translated text for a draft string in a specific locale.

**Schema** (existing - no changes):

```typescript
{
  id: text (PK),
  stringId: text (FK -> strings),
  locale: text (NOT NULL),           // e.g., "en", "es", "fr"
  value: text (NOT NULL),            // The translated text
  createdAt: timestamp,
  createdBy: text (FK -> users),
  updatedAt: timestamp,
  updatedBy: text (FK -> users)
}
```

**Constraints**:

- Unique (stringId, locale)
- locale must not be empty (CHECK)
- Covering index on (stringId, locale)

**Relationships**:

- Belongs to one String
- Represents current draft for one locale

### Translation Snapshot (translationSnapshots table)

An immutable, versioned copy of all translations for a project/locale at a specific point in time.

**Schema** (existing - no changes):

```typescript
{
  id: text (PK),
  projectId: text (FK -> projects),
  locale: text (NOT NULL),
  version: integer (NOT NULL),        // Monotonically increasing version number
  data: jsonb (NOT NULL),             // { "HOME.TITLE": "Welcome", ... }
  createdAt: timestamp (NOT NULL),    // When this snapshot was published
  createdBy: text (FK -> users)       // Who published this snapshot
}
```

**Constraints**:

- Unique (projectId, locale, version)
- Index on (projectId, locale, version) - primary lookup
- Index on (projectId, locale) - list versions

**Relationships**:

- Belongs to one Project
- Immutable once created (no updates, no deletes except cascade on project deletion)

**JSONB Structure**:

```json
{
  "HOME.TITLE": "Welcome to the App",
  "HOME.SUBTITLE": "Manage your translations",
  "AUTH.LOGIN": "Sign In",
  ...
}
```

## Entity Relationships

```
Project
  ├─── Strings (draft keys) [1:N]
  │     └─── Translations (draft values per locale) [1:N]
  │
  └─── TranslationSnapshots (published versions) [1:N]
        └─── data JSONB (all key:value pairs for locale)
```

## State Transitions

### String Draft Lifecycle

```
1. String Created
   ↓
2. Translations Added/Edited (draft)
   ↓
3. Snapshot Published (creates immutable copy in translationSnapshots)
   ↓
4. Draft Continues to Exist (can be edited further)
   ↓
5. Repeat steps 2-4
```

**Key Insight**: The draft in the `strings` and `translations` tables is NEVER deleted or reset. Publishing creates a snapshot copy, but the draft persists for continued editing.

### Version Number Assignment

Translation snapshots use monotonically increasing version numbers per project+locale:

```sql
-- Next version for a project+locale
SELECT COALESCE(MAX(version), 0) + 1
FROM translation_snapshots
WHERE project_id = ? AND locale = ?
```

Version numbers start at 1 for the first snapshot.

## Query Patterns

### 1. Get Version History for a String Key

**Goal**: Display all published versions + current draft for a specific string key

**Query Strategy**:

```typescript
// Step 1: Get all snapshots for project+locale
const snapshots = await drizzle.query.translationSnapshots.findMany({
  where: (snapshots, { and, eq }) => and(eq(snapshots.projectId, projectId), eq(snapshots.locale, locale)),
  orderBy: (snapshots, { desc }) => [desc(snapshots.version)],
});

// Step 2: Extract value for specific key from each snapshot's JSONB
const versionHistory = snapshots.map(snapshot => ({
  version: snapshot.version,
  value: snapshot.data[stringKey], // Extract from JSONB
  createdAt: snapshot.createdAt,
  createdBy: snapshot.createdBy,
}));

// Step 3: Get current draft
const stringRecord = await drizzle.query.strings.findFirst({
  where: (strings, { and, eq }) => and(eq(strings.projectId, projectId), eq(strings.key, stringKey)),
  with: {
    translations: {
      where: (translations, { eq }) => eq(translations.locale, locale),
      limit: 1,
    },
  },
});

const draft = stringRecord?.translations[0]
  ? {
      value: stringRecord.translations[0].value,
      updatedAt: stringRecord.translations[0].updatedAt,
      updatedBy: stringRecord.translations[0].updatedBy,
    }
  : null;

// Combine: { draft: {...}, versions: [...] }
```

### 2. Update Draft Translation

**Goal**: Modify the current draft value for a string+locale

**Query Strategy**:

```typescript
// Update with conflict detection (update still uses core API)
await drizzle
  .update(translations)
  .set({
    value: newValue,
    updatedAt: new Date(),
    updatedBy: userId,
  })
  .where(and(eq(translations.stringId, stringId), eq(translations.locale, locale)));

// Return updated draft with metadata for conflict detection
return {
  value: newValue,
  updatedAt: new Date(),
  updatedBy: userId,
};
```

### 3. Compare Two Versions

**Goal**: Retrieve two specific versions for side-by-side comparison

**Query Strategy**:

```typescript
// If comparing two snapshots
const versions = await drizzle.query.translationSnapshots.findMany({
  where: (snapshots, { and, eq, inArray }) =>
    and(eq(snapshots.projectId, projectId), eq(snapshots.locale, locale), inArray(snapshots.version, [v1, v2])),
});

// Extract key from both
const [version1, version2] = versions;
const comparison = {
  version1: { version: v1, value: version1.data[stringKey] },
  version2: { version: v2, value: version2.data[stringKey] },
};

// If comparing draft vs snapshot, mix draft query with snapshot query
```

## Validation Rules

### Draft String Editing

- **FR-014**: Draft edits must pass validation before persisting
  - Translation value cannot be empty
  - Locale must be in project's enabledLocales
  - StringId must exist and belong to the user's project

### Snapshot Immutability

- **FR-005**: Translation snapshots are immutable
  - No UPDATE operations allowed on translationSnapshots table
  - No DELETE operations (except cascade when project deleted)
  - Enforced at API layer (no edit/delete endpoints)

### Concurrent Edit Detection

- **FR-016**: Last-write-wins with warning
  - Compare current `translations.updatedAt` with client's last-fetched timestamp
  - If difference < 5 minutes, return warning (409 Conflict)
  - Client can force save (overwrites)

## Performance Considerations

### Indexing

All required indexes already exist:

- `translation_snapshots_project_locale_version_idx`: Efficient version lookup
- `translation_snapshots_project_locale_idx`: List all versions for project+locale
- `translations_string_id_locale_idx`: Fast draft lookup by string+locale
- `strings_project_id_idx`: Fast string lookup by project

### Pagination

For projects with >100 snapshots, API should paginate:

- Default: 20 versions per page
- Sort: DESC by version (newest first)
- Draft always included regardless of pagination

### Caching Strategy

Translation snapshots are immutable → aggressive caching:

- Cache-Control: public, max-age=31536000 (1 year)
- ETag based on version number
- Draft queries: Cache-Control: private, no-cache

## Summary

- **No schema changes required** - existing tables support all requirements
- **Draft persistence model**: Strings and translations persist across publishes; snapshots are separate immutable copies
- **Version history retrieval**: Query translationSnapshots, extract specific key from JSONB, combine with draft
- **Performance**: Existing indexes support efficient queries; pagination handles scale
- **Immutability enforced**: No API endpoints for snapshot modification/deletion
