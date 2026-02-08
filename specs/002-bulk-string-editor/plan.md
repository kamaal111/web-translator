# Implementation Plan: Bulk String Editor

**Feature Branch**: `002-bulk-string-editor`  
**Created**: February 8, 2026  
**Status**: Draft  
**Priority**: P1

---

## Executive Summary

This plan details the implementation of a bulk string editor that allows users to view and edit all project strings and translations in a single spreadsheet-like interface. The feature addresses the current limitation where users must edit strings one at a time, significantly improving efficiency for translators and content managers.

**Key Benefits**:

- Reduce translation time by 60% for multi-string workflows
- Enable single-save operation for batch updates
- Provide spreadsheet-like UX familiar to translators
- Support filtering for targeted translation work

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│  BulkEditorPage                                             │
│    ├─ BulkEditorTable (TanStack Table + virtualization)    │
│    │   ├─ BulkEditorCell (editable textarea)               │
│    │   └─ BulkEditorHeader                                 │
│    ├─ BulkEditorFilters                                     │
│    ├─ BulkEditorProgressBar                                 │
│    └─ BulkEditorSaveButton                                  │
│                                                              │
│  State Management:                                          │
│    ├─ useBulkEditor hook (edit state, dirty tracking)      │
│    ├─ useStrings hook (data fetching - reuse existing)     │
│    └─ React Hook Form or Zustand for complex state         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Hono)                            │
├─────────────────────────────────────────────────────────────┤
│  New Endpoint:                                              │
│    PATCH /app-api/v1/p/:projectId/strings/bulk             │
│                                                              │
│  Existing Endpoints (reuse):                                │
│    GET /app-api/v1/s/:projectId (list all strings)         │
│                                                              │
│  Business Logic:                                            │
│    ├─ BulkUpdateService                                     │
│    │   ├─ Validate all translations                         │
│    │   ├─ Detect conflicts (per-string timestamps)         │
│    │   └─ Atomic transaction for all updates               │
│    └─ TranslationsRepository (extend existing)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (Postgres)                        │
├─────────────────────────────────────────────────────────────┤
│  Existing Tables:                                           │
│    ├─ strings (drafts)                                      │
│    └─ translation_snapshots (published versions)           │
│                                                              │
│  No schema changes needed ✓                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Analysis

### Existing Schema (No Changes Required)

**`strings` table** (draft translations):

```sql
CREATE TABLE strings (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  key TEXT NOT NULL,
  context TEXT,
  translations JSONB NOT NULL,  -- { "en": "value", "es": "valor", ... }
  updated_at TIMESTAMP NOT NULL,
  updated_by UUID REFERENCES users(id),
  UNIQUE(project_id, key)
);
```

**Why no schema changes?**

- Bulk update operates on existing `strings.translations` JSONB field
- Conflict detection uses existing `strings.updated_at` timestamp
- Filtering/search can use existing indexes

**Relevant Indexes** (already exist):

- `idx_strings_project_id` - for loading all strings in project
- `idx_strings_project_key` - for key lookups

---

## API Design

### New Endpoint: Bulk Update

```typescript
PATCH /app-api/v1/p/:projectId/strings/bulk
```

**Request Schema**:

```typescript
interface BulkUpdateRequest {
  updates: Array<{
    stringKey: string; // Required: which string to update
    translations: Record<string, string>; // Locale -> value pairs
    ifUnmodifiedSince?: string; // ISO timestamp for conflict detection
  }>;
}

// Example:
{
  updates: [
    {
      stringKey: 'HOME.TITLE',
      translations: { es: 'Bienvenido', fr: 'Bienvenue' },
      ifUnmodifiedSince: '2026-02-08T10:30:00Z',
    },
    {
      stringKey: 'HOME.SUBTITLE',
      translations: { es: 'Empezar ahora' },
    },
  ];
}
```

**Response Schema**:

```typescript
interface BulkUpdateResponse {
  // Successfully updated strings
  updated: Array<{
    stringKey: string;
    translations: Record<string, string>;
    updatedAt: string;
    updatedBy: {
      id: string;
      name: string;
    };
  }>;

  // Strings that had conflicts
  conflicts: Array<{
    stringKey: string;
    reason: 'modified_by_other_user';
    lastModifiedAt: string;
    lastModifiedBy: {
      id: string;
      name: string;
    };
    currentTranslations: Record<string, string>;
  }>;

  // Validation errors
  errors: Array<{
    stringKey: string;
    locale?: string;
    message: string;
  }>;
}

// Example success response:
{
  updated: [
    {
      stringKey: "HOME.TITLE",
      translations: { "en": "Welcome", "es": "Bienvenido", "fr": "Bienvenue" },
      updatedAt: "2026-02-08T11:00:00Z",
      updatedBy: { id: "user-123", name: "John Doe" }
    }
  ],
  conflicts: [
    {
      stringKey: "HOME.SUBTITLE",
      reason: "modified_by_other_user",
      lastModifiedAt: "2026-02-08T10:45:00Z",
      lastModifiedBy: { id: "user-456", name: "Jane Smith" },
      currentTranslations: { "en": "Start now", "es": "Comenzar ahora" }
    }
  ],
  errors: []
}
```

**Status Codes**:

- `200 OK` - Partial or full success (check `updated`, `conflicts`, and `errors` arrays)
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No access to project
- `404 Not Found` - Project doesn't exist
- `422 Unprocessable Entity` - All updates failed validation

**Conflict Handling Strategy**:

- Per-string conflict detection (not all-or-nothing)
- User gets partial success with conflicts clearly identified
- Frontend can retry just the conflicting strings
- Conflicts use `ifUnmodifiedSince` timestamp comparison

### Reused Endpoints

**Load strings** (already exists):

```typescript
GET /app-api/v1/s/:projectId
// Returns all strings with translations - reuse as-is
```

---

## Frontend Implementation

### Routing

Add new route:

```typescript
// web/src/routing/router.tsx
<Route path="/projects/:id/bulk-editor" element={<BulkEditorPage />} />
```

Add to SPA routes config:

```typescript
// server/src/web/router.ts
const WEB_ROUTES = [
  // ... existing routes
  '/projects/:id/bulk-editor', // NEW
];
```

### Component Hierarchy

```
BulkEditorPage
├─ BulkEditorHeader
│  ├─ ProjectBreadcrumb
│  ├─ UnsavedChangesIndicator
│  └─ SaveAllButton
│
├─ BulkEditorFilters (sidebar or top bar)
│  ├─ LocaleFilter
│  ├─ MissingTranslationsFilter
│  ├─ KeySearchInput
│  └─ ContextFilter
│
├─ BulkEditorProgressBar
│  └─ LocaleProgressIndicator (per locale)
│
└─ BulkEditorTable (main grid)
   ├─ BulkEditorHeader (fixed)
   │  └─ ColumnHeader (String Key, Context, [locales...])
   │
   └─ BulkEditorRow (virtualized)
      ├─ StringKeyCell (read-only)
      ├─ ContextCell (read-only)
      └─ BulkEditorCell (per locale, editable)
         ├─ TextArea
         ├─ EmptyWarningIcon
         └─ DirtyIndicator
```

### State Management Strategy

**Option 1: React Hook Form + TanStack Query (Recommended)**

```typescript
interface BulkEditorState {
  // From server (TanStack Query)
  strings: StringResponse[]; // Original data
  isLoadingStrings: boolean;

  // Local form state (React Hook Form)
  formValues: Record<stringKey, Record<locale, string>>;
  dirtyFields: Set<`${stringKey}.${locale}`>;
  errors: Record<string, string>;

  // Filters (URL state via useSearchParams)
  filters: {
    keyPattern?: string;
    missingLocale?: string;
    contextPattern?: string;
  };

  // Save state (TanStack Mutation)
  isSaving: boolean;
  saveResult?: BulkUpdateResponse;
}
```

**Option 2: Zustand for Complex State**

```typescript
// Only if React Hook Form becomes unwieldy for 1000+ strings
interface BulkEditorStore {
  // Original data
  strings: Map<string, StringResponse>;

  // User edits
  edits: Map<string, Map<string, string>>; // stringKey -> locale -> value

  // Dirty tracking
  dirtyKeys: Set<string>;

  // Actions
  setTranslation: (key: string, locale: string, value: string) => void;
  clearEdits: () => void;
  saveAll: () => Promise<BulkUpdateResponse>;
}
```

**Recommendation**: Start with Option 1 (React Hook Form) - simpler, familiar patterns. Switch to Zustand if performance issues arise with 1000+ strings.

### Key Implementation Details

#### 1. Virtualization

For 1000+ strings, use virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function BulkEditorTable({ strings, locales }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: strings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,  // Row height
    overscan: 10,            // Render 10 extra rows
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const string = strings[virtualRow.index];
          return (
            <BulkEditorRow
              key={string.key}
              string={string}
              locales={locales}
              style={{
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
```

#### 2. Dirty Tracking

Track which cells have unsaved changes:

```typescript
interface DirtyState {
  isDirty: boolean;
  dirtyCount: number;
  dirtyCells: Set<string>; // "stringKey.locale" format
}

function useDirtyTracking() {
  const [dirtyState, setDirtyState] = useState<DirtyState>({
    isDirty: false,
    dirtyCount: 0,
    dirtyCells: new Set(),
  });

  const markDirty = (stringKey: string, locale: string) => {
    const cellId = `${stringKey}.${locale}`;
    setDirtyState(prev => ({
      isDirty: true,
      dirtyCount: prev.dirtyCells.has(cellId) ? prev.dirtyCount : prev.dirtyCount + 1,
      dirtyCells: new Set(prev.dirtyCells).add(cellId),
    }));
  };

  return { dirtyState, markDirty };
}
```

#### 3. Conflict Handling UI

Display conflicts clearly:

```typescript
function ConflictDialog({ conflicts, onResolve, onCancel }) {
  return (
    <Dialog.Root open={conflicts.length > 0}>
      <Dialog.Content>
        <Dialog.Title>⚠️ Conflicts Detected</Dialog.Title>
        <Dialog.Description>
          {conflicts.length} strings were modified by other users since you started editing.
        </Dialog.Description>

        {conflicts.map(conflict => (
          <Box key={conflict.stringKey} mb="3">
            <Text weight="bold">{conflict.stringKey}</Text>
            <Text size="2" color="gray">
              Modified by {conflict.lastModifiedBy.name} at{' '}
              <FormattedDate value={conflict.lastModifiedAt} />
            </Text>

            <Grid columns="2" gap="2" mt="2">
              <Box>
                <Text size="1" color="gray">Your version:</Text>
                <Code>{JSON.stringify(yourEdit)}</Code>
              </Box>
              <Box>
                <Text size="1" color="gray">Current version:</Text>
                <Code>{JSON.stringify(conflict.currentTranslations)}</Code>
              </Box>
            </Grid>

            <Flex gap="2" mt="2">
              <Button size="1" onClick={() => onResolve(conflict.stringKey, 'keep-yours')}>
                Keep My Version
              </Button>
              <Button size="1" variant="soft" onClick={() => onResolve(conflict.stringKey, 'keep-theirs')}>
                Use Current Version
              </Button>
            </Flex>
          </Box>
        ))}

        <Flex gap="2" mt="4">
          <Button onClick={onCancel} variant="soft">Cancel</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

#### 4. Unsaved Changes Warning

Prevent accidental data loss:

```typescript
function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Also block React Router navigation
  useBlocker(({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname);
}
```

#### 5. Filtering Implementation

URL-based filters for shareable links:

```typescript
function useBulkEditorFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    keyPattern: searchParams.get('key') || undefined,
    missingLocale: searchParams.get('missing') || undefined,
    context: searchParams.get('context') || undefined,
  };

  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams(prev => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    });
  };

  // Apply filters to strings
  const filteredStrings = useMemo(() => {
    let result = allStrings;

    if (filters.keyPattern) {
      const regex = new RegExp(filters.keyPattern, 'i');
      result = result.filter(s => regex.test(s.key));
    }

    if (filters.missingLocale) {
      result = result.filter(
        s => !s.translations[filters.missingLocale] || s.translations[filters.missingLocale].trim() === '',
      );
    }

    if (filters.context) {
      result = result.filter(s => s.context?.toLowerCase().includes(filters.context.toLowerCase()));
    }

    return result;
  }, [allStrings, filters]);

  return { filters, setFilter, filteredStrings };
}
```

---

## Backend Implementation

### New Route: Bulk Update

**File**: `server/src/strings/routes/bulk-update.ts`

```typescript
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

// Schemas
const BulkUpdateItemSchema = z.object({
  stringKey: z.string().min(1),
  translations: z.record(z.string(), z.string()),
  ifUnmodifiedSince: z.string().datetime().optional(),
});

const BulkUpdateRequestSchema = z.object({
  updates: z.array(BulkUpdateItemSchema).min(1).max(500), // Limit to 500 updates
});

const BulkUpdateResponseSchema = z.object({
  updated: z.array(
    z.object({
      stringKey: z.string(),
      translations: z.record(z.string(), z.string()),
      updatedAt: z.string().datetime(),
      updatedBy: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
  ),
  conflicts: z.array(
    z.object({
      stringKey: z.string(),
      reason: z.literal('modified_by_other_user'),
      lastModifiedAt: z.string().datetime(),
      lastModifiedBy: z.object({
        id: z.string(),
        name: z.string(),
      }),
      currentTranslations: z.record(z.string(), z.string()),
    }),
  ),
  errors: z.array(
    z.object({
      stringKey: z.string(),
      locale: z.string().optional(),
      message: z.string(),
    }),
  ),
});

// Route definition
export const bulkUpdateRoute = createRoute({
  method: 'patch',
  path: '/p/{projectId}/strings/bulk',
  request: {
    params: z.object({ projectId: z.string().uuid() }),
    body: {
      content: {
        'application/json': {
          schema: BulkUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BulkUpdateResponseSchema,
        },
      },
      description: 'Bulk update results (may include partial success)',
    },
    400: { description: 'Invalid request' },
    401: { description: 'Not authenticated' },
    403: { description: 'No access to project' },
    404: { description: 'Project not found' },
  },
  tags: ['strings'],
});

// Handler
export async function bulkUpdateHandler(c: Context) {
  const { projectId } = c.req.valid('param');
  const { updates } = c.req.valid('json');
  const userId = getAuthUserId(c);

  const logger = getLogger(c);
  logger.info('Bulk update requested', {
    projectId,
    userId,
    updateCount: updates.length,
  });

  // Verify project access
  const { db } = c.var;
  const project = await db.projects.findById(projectId, userId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Process updates with transaction
  const result = await db.transaction(async tx => {
    const updated = [];
    const conflicts = [];
    const errors = [];

    for (const update of updates) {
      try {
        // Fetch current string
        const currentString = await tx.strings.findByKey(projectId, update.stringKey);

        if (!currentString) {
          errors.push({
            stringKey: update.stringKey,
            message: 'String not found',
          });
          continue;
        }

        // Check for conflicts
        if (update.ifUnmodifiedSince) {
          const lastModified = new Date(currentString.updatedAt);
          const clientTimestamp = new Date(update.ifUnmodifiedSince);

          if (lastModified > clientTimestamp) {
            conflicts.push({
              stringKey: update.stringKey,
              reason: 'modified_by_other_user',
              lastModifiedAt: currentString.updatedAt.toISOString(),
              lastModifiedBy: {
                id: currentString.updatedBy.id,
                name: currentString.updatedBy.name,
              },
              currentTranslations: currentString.translations,
            });
            continue;
          }
        }

        // Validate translations
        const validationErrors = validateTranslations(update.translations, project.enabledLocales);
        if (validationErrors.length > 0) {
          errors.push(
            ...validationErrors.map(err => ({
              stringKey: update.stringKey,
              locale: err.locale,
              message: err.message,
            })),
          );
          continue;
        }

        // Merge translations (preserve existing locales not in update)
        const mergedTranslations = {
          ...currentString.translations,
          ...update.translations,
        };

        // Update the string
        const updatedString = await tx.strings.update({
          projectId,
          key: update.stringKey,
          translations: mergedTranslations,
          updatedBy: userId,
        });

        updated.push({
          stringKey: update.stringKey,
          translations: updatedString.translations,
          updatedAt: updatedString.updatedAt.toISOString(),
          updatedBy: {
            id: updatedString.updatedBy.id,
            name: updatedString.updatedBy.name,
          },
        });
      } catch (err) {
        logger.error('Failed to update string in bulk', {
          stringKey: update.stringKey,
          error: err,
        });
        errors.push({
          stringKey: update.stringKey,
          message: 'Internal error during update',
        });
      }
    }

    return { updated, conflicts, errors };
  });

  logger.info('Bulk update completed', {
    projectId,
    updatedCount: result.updated.length,
    conflictCount: result.conflicts.length,
    errorCount: result.errors.length,
  });

  return c.json(result, 200);
}
```

### Repository Extension

**File**: `server/src/strings/repositories/strings-repository.ts`

```typescript
// Add method to TranslationsRepository class

async update(params: {
  projectId: string;
  key: string;
  translations: Record<string, string>;
  updatedBy: string;
}): Promise<StringWithUser> {
  const { projectId, key, translations, updatedBy } = params;

  const result = await this.db
    .update(strings)
    .set({
      translations: sql`${sql.raw(JSON.stringify(translations))}::jsonb`,
      updatedAt: new Date(),
      updatedBy,
    })
    .where(
      and(
        eq(strings.projectId, projectId),
        eq(strings.key, key)
      )
    )
    .returning();

  if (result.length === 0) {
    throw new NotFoundError('String not found');
  }

  // Join with user data
  const stringWithUser = await this.db
    .select({
      id: strings.id,
      key: strings.key,
      context: strings.context,
      translations: strings.translations,
      updatedAt: strings.updatedAt,
      updatedBy: {
        id: users.id,
        name: users.name,
      },
    })
    .from(strings)
    .innerJoin(users, eq(strings.updatedBy, users.id))
    .where(eq(strings.id, result[0].id))
    .limit(1);

  return stringWithUser[0];
}
```

### Validation Utility

```typescript
function validateTranslations(
  translations: Record<string, string>,
  enabledLocales: string[],
): Array<{ locale: string; message: string }> {
  const errors = [];

  for (const [locale, value] of Object.entries(translations)) {
    // Check if locale is enabled
    if (!enabledLocales.includes(locale)) {
      errors.push({
        locale,
        message: `Locale '${locale}' is not enabled for this project`,
      });
      continue;
    }

    // Check for empty/whitespace-only values (warning level, not blocking)
    if (!value || value.trim() === '') {
      // Could add to warnings array instead of errors
      // For MVP, we'll allow empty values
    }

    // Check max length (if applicable)
    if (value.length > 10000) {
      errors.push({
        locale,
        message: 'Translation exceeds maximum length of 10,000 characters',
      });
    }
  }

  return errors;
}
```

---

## Testing Strategy

### Backend Tests

**File**: `server/src/strings/__tests__/bulk-update.test.ts`

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import TestHelper from '../../__tests__/test-helper';

const helper = new TestHelper();

describe('Bulk Update Strings', () => {
  beforeAll(helper.beforeAll);
  afterAll(helper.afterAll);

  test('should update multiple strings successfully', async () => {
    // Setup: Create project and strings
    const project = await helper.createProject();
    await helper.upsertTranslations(project.id, [
      { key: 'KEY1', translations: { en: 'Value 1' } },
      { key: 'KEY2', translations: { en: 'Value 2' } },
    ]);

    const response = await helper.signInAsDefaultUser();
    const token = response.headers.get('set-auth-token');

    // Act: Bulk update
    const updateResponse = await helper.app.request(`/app-api/v1/p/${project.id}/strings/bulk`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        updates: [
          {
            stringKey: 'KEY1',
            translations: { es: 'Valor 1', fr: 'Valeur 1' },
          },
          {
            stringKey: 'KEY2',
            translations: { es: 'Valor 2' },
          },
        ],
      }),
    });

    // Assert
    expect(updateResponse.status).toBe(200);
    const result = await updateResponse.json();
    expect(result.updated).toHaveLength(2);
    expect(result.conflicts).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.updated[0].translations).toMatchObject({
      en: 'Value 1',
      es: 'Valor 1',
      fr: 'Valeur 1',
    });
  });

  test('should detect conflicts', async () => {
    // Setup: Create string
    const project = await helper.createProject();
    await helper.upsertTranslations(project.id, [{ key: 'KEY1', translations: { en: 'Original' } }]);

    const response = await helper.signInAsDefaultUser();
    const token = response.headers.get('set-auth-token');

    // Get initial timestamp
    const stringsResponse = await helper.app.request(`/app-api/v1/s/${project.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const strings = await stringsResponse.json();
    const originalTimestamp = strings.strings[0].updatedAt;

    // Modify string (simulating another user)
    await helper.upsertTranslations(project.id, [{ key: 'KEY1', translations: { en: 'Modified by other user' } }]);

    // Act: Try to bulk update with old timestamp
    const updateResponse = await helper.app.request(`/app-api/v1/p/${project.id}/strings/bulk`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        updates: [
          {
            stringKey: 'KEY1',
            translations: { es: 'Mi versión' },
            ifUnmodifiedSince: originalTimestamp,
          },
        ],
      }),
    });

    // Assert: Should get conflict
    expect(updateResponse.status).toBe(200);
    const result = await updateResponse.json();
    expect(result.updated).toHaveLength(0);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].stringKey).toBe('KEY1');
    expect(result.conflicts[0].reason).toBe('modified_by_other_user');
  });

  test('should validate enabled locales', async () => {
    const project = await helper.createProject({
      enabledLocales: ['en', 'es'],
    });
    await helper.upsertTranslations(project.id, [{ key: 'KEY1', translations: { en: 'Value 1' } }]);

    const response = await helper.signInAsDefaultUser();
    const token = response.headers.get('set-auth-token');

    // Act: Try to add translation for non-enabled locale
    const updateResponse = await helper.app.request(`/app-api/v1/p/${project.id}/strings/bulk`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        updates: [
          {
            stringKey: 'KEY1',
            translations: { fr: 'Valeur 1' }, // 'fr' not enabled
          },
        ],
      }),
    });

    // Assert
    expect(updateResponse.status).toBe(200);
    const result = await updateResponse.json();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].locale).toBe('fr');
    expect(result.errors[0].message).toContain('not enabled');
  });

  test('should handle partial success', async () => {
    const project = await helper.createProject();
    await helper.upsertTranslations(project.id, [{ key: 'KEY1', translations: { en: 'Value 1' } }]);

    const response = await helper.signInAsDefaultUser();
    const token = response.headers.get('set-auth-token');

    // Act: Update one valid string and one non-existent string
    const updateResponse = await helper.app.request(`/app-api/v1/p/${project.id}/strings/bulk`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        updates: [
          {
            stringKey: 'KEY1',
            translations: { es: 'Valor 1' },
          },
          {
            stringKey: 'NON_EXISTENT',
            translations: { es: 'No existe' },
          },
        ],
      }),
    });

    // Assert: Should have 1 success and 1 error
    expect(updateResponse.status).toBe(200);
    const result = await updateResponse.json();
    expect(result.updated).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('not found');
  });
});
```

### Frontend Tests

**File**: `web/src/projects/components/bulk-editor/bulk-editor.test.tsx`

```typescript
import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkEditorPage } from './bulk-editor-page';

describe('BulkEditorPage', () => {
  test('should render all strings in grid', async () => {
    // Mock API response
    const mockStrings = [
      { key: 'HOME.TITLE', context: 'Homepage', translations: { en: 'Welcome', es: '' } },
      { key: 'HOME.SUBTITLE', context: null, translations: { en: 'Get started', es: 'Empezar' } },
    ];

    vi.mock('@/projects/hooks/use-strings', () => ({
      default: () => ({ strings: mockStrings, isLoading: false }),
    }));

    render(<BulkEditorPage projectId="test-project" />);

    // Assert: All strings visible
    await waitFor(() => {
      expect(screen.getByText('HOME.TITLE')).toBeInTheDocument();
      expect(screen.getByText('HOME.SUBTITLE')).toBeInTheDocument();
    });
  });

  test('should track dirty state when editing', async () => {
    const user = userEvent.setup();
    const mockStrings = [
      { key: 'HOME.TITLE', translations: { en: 'Welcome', es: '' } },
    ];

    render(<BulkEditorPage projectId="test-project" />);

    // Act: Edit a translation
    const esCell = await screen.findByPlaceholderText(/spanish/i);
    await user.type(esCell, 'Bienvenido');

    // Assert: Dirty indicator visible
    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  test('should save all changes on save button click', async () => {
    const user = userEvent.setup();
    const mockSave = vi.fn().mockResolvedValue({
      updated: [{ stringKey: 'HOME.TITLE' }],
      conflicts: [],
      errors: [],
    });

    vi.mock('@/projects/hooks/use-bulk-editor', () => ({
      default: () => ({ saveAll: mockSave, isSaving: false }),
    }));

    render(<BulkEditorPage projectId="test-project" />);

    // Act: Edit and save
    const esCell = await screen.findByPlaceholderText(/spanish/i);
    await user.type(esCell, 'Bienvenido');

    const saveButton = screen.getByRole('button', { name: /save all/i });
    await user.click(saveButton);

    // Assert: Save called
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalled();
    });
  });

  test('should display conflicts in dialog', async () => {
    const mockConflicts = [
      {
        stringKey: 'HOME.TITLE',
        reason: 'modified_by_other_user',
        lastModifiedBy: { name: 'Jane Doe' },
        currentTranslations: { en: 'New Welcome' },
      },
    ];

    const mockSave = vi.fn().mockResolvedValue({
      updated: [],
      conflicts: mockConflicts,
      errors: [],
    });

    render(<BulkEditorPage projectId="test-project" />);

    // Trigger save that returns conflicts
    const saveButton = screen.getByRole('button', { name: /save all/i });
    await userEvent.click(saveButton);

    // Assert: Conflict dialog visible
    await waitFor(() => {
      expect(screen.getByText(/conflicts detected/i)).toBeInTheDocument();
      expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
    });
  });

  test('should filter by missing translations', async () => {
    const user = userEvent.setup();
    const mockStrings = [
      { key: 'KEY1', translations: { en: 'Value 1', es: 'Valor 1' } },
      { key: 'KEY2', translations: { en: 'Value 2', es: '' } }, // Missing ES
    ];

    render(<BulkEditorPage projectId="test-project" />);

    // Act: Apply filter
    const filterSelect = screen.getByLabelText(/missing translations/i);
    await user.selectOptions(filterSelect, 'es');

    // Assert: Only KEY2 visible
    await waitFor(() => {
      expect(screen.queryByText('KEY1')).not.toBeInTheDocument();
      expect(screen.getByText('KEY2')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Considerations

### 1. Virtualization

**Problem**: Rendering 1000+ table rows causes lag and poor UX.

**Solution**: Use `@tanstack/react-virtual` to render only visible rows:

- Render only ~20 visible rows + 10 overscan
- Total DOM nodes: ~30 instead of 1000+
- Smooth 60fps scrolling

```typescript
// See implementation details in "Frontend Implementation" section above
```

### 2. Debounced Validation

**Problem**: Validating on every keystroke is expensive for 1000+ strings.

**Solution**: Debounce validation by 300ms:

```typescript
const debouncedValidate = useMemo(() => debounce((value: string) => validateField(value), 300), []);
```

### 3. Batch Rendering

**Problem**: Updating state for 1000 cells causes re-renders.

**Solution**: Use `startTransition` for non-urgent updates:

```typescript
import { startTransition } from 'react';

const handleChange = (value: string) => {
  // Urgent: Update the specific cell immediately
  setFieldValue(value);

  // Non-urgent: Update aggregated stats
  startTransition(() => {
    updateProgressBar();
    updateDirtyCount();
  });
};
```

### 4. Backend Transaction Batching

**Problem**: Updating 100 strings = 100 individual database writes.

**Solution**: Use database transaction for atomic bulk update:

```typescript
await db.transaction(async tx => {
  for (const update of updates) {
    await tx.strings.update(update);
  }
});
// All or nothing - ensures consistency
```

### 5. Optimistic Updates

**Problem**: Waiting for server response after every cell edit feels slow.

**Solution**: Update UI immediately, rollback on error:

```typescript
const { mutate } = useMutation({
  mutationFn: bulkUpdate,
  onMutate: async updates => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['strings', projectId] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['strings', projectId]);

    // Optimistically update
    queryClient.setQueryData(['strings', projectId], old => ({
      ...old,
      strings: applyUpdates(old.strings, updates),
    }));

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['strings', projectId], context.previous);
  },
  onSettled: () => {
    // Refetch after success or error
    queryClient.invalidateQueries({ queryKey: ['strings', projectId] });
  },
});
```

---

## Security Considerations

### 1. Authorization

- Bulk update must verify project access (same as single update)
- Use existing project ownership checks
- Verify user has write access to project

### 2. Rate Limiting

```typescript
// Add rate limit middleware to bulk update route
import { rateLimiter } from '../middleware/rate-limiter';

router.patch(
  '/p/:projectId/strings/bulk',
  rateLimiter({ maxRequests: 10, windowMs: 60000 }), // 10 req/min
  bulkUpdateHandler,
);
```

### 3. Request Size Limits

- Limit to 500 strings per bulk update request
- Enforce via Zod schema validation
- Prevents memory exhaustion attacks

```typescript
const BulkUpdateRequestSchema = z.object({
  updates: z.array(BulkUpdateItemSchema).min(1).max(500, 'Cannot update more than 500 strings at once'),
});
```

### 4. Audit Logging

```typescript
// Log bulk operations with details
getLogger(c).info('Bulk update completed', {
  userId,
  projectId,
  updatedCount: result.updated.length,
  conflictCount: result.conflicts.length,
  errorCount: result.errors.length,
  stringKeys: result.updated.map(u => u.stringKey),
  timestamp: new Date().toISOString(),
});
```

### 5. Input Validation

- Sanitize string keys (prevent SQL injection via key lookups)
- Validate locale codes against project's enabled locales
- Check translation max length (10,000 chars)
- Prevent XSS by escaping translations in UI

---

## Migration and Rollout Plan

### Week 1: Foundation (Phase 1)

- [ ] Create bulk editor route and basic page
- [ ] Implement grid UI with TanStack Table
- [ ] Hook up data loading (reuse existing endpoint)
- [ ] Implement in-place editing
- [ ] Track dirty state

**Milestone**: Can view and edit strings in grid (no save yet)

### Week 2: Backend + Save (Phase 1)

- [ ] Create bulk update endpoint with Zod schemas
- [ ] Implement conflict detection
- [ ] Add validation logic
- [ ] Wire frontend save button to backend
- [ ] Add error handling and loading states

**Milestone**: MVP - Can save bulk edits

### Week 3: Testing + Polish

- [ ] Write backend tests (bulk-update.test.ts)
- [ ] Write frontend component tests
- [ ] Add OpenAPI documentation
- [ ] Run `just ready` and fix all issues
- [ ] Internal dogfooding and bug fixes

**Milestone**: Feature complete and tested

### Week 4: Filtering + UX (Phase 2)

- [ ] Add filter by missing translations
- [ ] Add key search
- [ ] Add context filter
- [ ] Add progress indicators
- [ ] Add unsaved changes warning

**Milestone**: Production-ready with filters

### Week 5: Performance (Phase 4)

- [ ] Implement virtualization for 1000+ strings
- [ ] Add optimistic updates
- [ ] Performance testing and optimization
- [ ] Load testing with 5000 strings

**Milestone**: Scales to large projects

### Week 6: Launch

- [ ] Beta release to select users
- [ ] Gather feedback
- [ ] Fix priority issues
- [ ] General release
- [ ] Monitor metrics

---

## Open Questions & Decisions

### 1. Conflict Resolution Strategy ✅ DECISION MADE

**Question**: How to handle conflicts when multiple users edit simultaneously?

**Options**:

- A. Fail entire batch if any conflict
- B. Partial success with conflict list ✓
- C. Last-write-wins (no conflict detection)

**Decision**: **Option B** - Return partial success + conflicts array

- Rationale: Most flexible; user can retry just conflicting strings
- UX: Show conflicts in dialog, let user resolve individually

### 2. Empty Translations ✅ DECISION MADE

**Question**: Should empty translations block save?

**Options**:

- A. Block save, force completion
- B. Allow save with warnings ✓
- C. No validation

**Decision**: **Option B** - Allow empty, show visual warning

- Rationale: Users often work incrementally; shouldn't block partial progress
- UX: Show ⚠️ icon on empty required cells

### 3. Table Library ✅ DECISION MADE

**Question**: Which table library to use?

**Options**:

- A. TanStack Table (headless) ✓
- B. AG Grid (feature-rich, commercial)
- C. react-data-grid
- D. Custom implementation

**Decision**: **Option A - TanStack Table**

- Rationale: Free, flexible, headless (full styling control), virtualization built-in
- Radix UI compatible (same philosophy)
- Can upgrade to AG Grid later if needed

### 4. State Management ✅ DECISION MADE

**Question**: How to manage complex editor state?

**Options**:

- A. React Hook Form + TanStack Query ✓
- B. Zustand store
- C. Redux Toolkit

**Decision**: **Option A** for MVP

- Rationale: Simpler, familiar patterns, leverages existing TanStack Query setup
- Can migrate to Zustand if performance issues arise with 1000+ strings

### 5. Navigation ⚠️ PENDING

**Question**: Where should bulk editor live in nav?

**Options**:

- A. Separate page/route (e.g., `/projects/:id/bulk-editor`) ✓ Recommended
- B. Tab within project page
- C. Modal overlay

**To decide**: Team preference - Page vs Tab?

### 6. Mobile Support ⚠️ PENDING

**Question**: Should bulk editor work on mobile?

**Options**:

- A. Desktop-only, redirect mobile users ✓ MVP
- B. Responsive mobile view (card-based)
- C. PWA with offline sync

**To decide**: Is mobile a requirement? Check analytics for mobile usage.

---

## Success Metrics

### Primary KPIs

- **Adoption**: 80% of multi-string edits use bulk editor (vs old method)
- **Efficiency**: Average time to translate 10 strings reduced by 60%
- **Reliability**: Bulk save success rate >95%
- **Performance**: Editor load time <3s for 1000 strings

### Secondary Metrics

- Users per week actively using bulk editor
- Average number of strings edited per session
- Conflict rate (should be <5%)
- Feature satisfaction score (survey)

### Monitoring

- Add analytics events:
  - `bulk_editor_opened`
  - `bulk_editor_saved` (with count of strings)
  - `bulk_editor_conflict` (track frequency)
  - `bulk_editor_error` (track failures)

---

## Risks and Mitigation

| Risk                                         | Impact | Likelihood | Mitigation                                         |
| -------------------------------------------- | ------ | ---------- | -------------------------------------------------- |
| Performance issues with 1000+ strings        | High   | Medium     | Implement virtualization from start; load testing  |
| Concurrent editing conflicts frustrate users | Medium | Medium     | Clear conflict UI; educate users on workflow       |
| Data loss from accidental navigation         | High   | Low        | Unsaved changes warning; auto-save draft (Phase 3) |
| Backend bulk endpoint timeout                | Medium | Low        | 500 string limit; optimize DB queries              |
| Users confused by new UI                     | Medium | Low        | Add onboarding tooltip; user guide                 |

---

## Dependencies

### External Libraries (New)

- `@tanstack/react-table` (^8.0.0) - Table/grid foundation
- `@tanstack/react-virtual` (^3.0.0) - Virtualization for performance

### Internal Dependencies (Existing)

- TanStack Query (data fetching) ✓
- Radix UI Themes (UI components) ✓
- React Router (routing) ✓
- Zod (validation) ✓
- Hono (backend framework) ✓

### No Breaking Changes

- Feature is additive
- No changes to existing endpoints or schemas
- Existing string editing flow unaffected

---

## Rollback Plan

If critical issues arise post-launch:

1. **Soft rollback**: Hide "Bulk Editor" button via feature flag
2. **Hard rollback**: Revert git branch, redeploy previous version
3. **Data safety**: Bulk update uses transaction; no partial writes
4. **User impact**: Low - users can fall back to single-string editor

---

## Next Steps

Upon approval of this plan:

1. Create feature branch: `002-bulk-string-editor`
2. Create detailed task breakdown in `tasks.md`
3. Estimate work (story points or days)
4. Schedule implementation sprints
5. Assign developers
6. Begin Phase 1 implementation

**Estimated Timeline**:

- Phase 1 (MVP): 2 weeks
- Phase 2 (Filtering): 1 week
- Phase 3 (UX polish): 1 week
- Phase 4 (Performance): 1 week
- **Total**: 5 weeks to production-ready

---

## Approval Sign-off

- [ ] Product Owner
- [ ] Technical Lead
- [ ] UX Designer
- [ ] QA Lead

**Approved by**: ******\_\_\_\_******  
**Date**: ******\_\_\_\_******

---

**Status**: Ready for task breakdown → implementation
