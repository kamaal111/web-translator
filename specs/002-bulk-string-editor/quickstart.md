# Quickstart: Bulk String Editor

**Feature**: 002-bulk-string-editor
**Date**: 2026-02-15

## Prerequisites

1. Node.js/Bun installed (Bun 1.3+)
2. Docker running (for PostgreSQL)
3. Repository cloned on branch `002-bulk-string-editor`

## Setup

```bash
cd /path/to/web-translator

just start-services

just migrate

just dev
```

## New Dependencies

Install in the `web/` package before starting development:

```bash
cd web
bun add @tanstack/react-table @tanstack/react-virtual
```

## Key Files to Implement

### Server (minimal changes)

| File                                      | Action | Purpose                                         |
| ----------------------------------------- | ------ | ----------------------------------------------- |
| `server/src/web/router.ts`                | MODIFY | Add `/projects/:id/bulk-editor` to `WEB_ROUTES` |
| `server/src/web/__tests__/router.test.ts` | MODIFY | Add test for new SPA route                      |

### Frontend (bulk of the work)

| File                                                                           | Action | Purpose                                              |
| ------------------------------------------------------------------------------ | ------ | ---------------------------------------------------- |
| `web/src/routing/router.tsx`                                                   | MODIFY | Add lazy route for bulk editor page                  |
| `web/src/pages/bulk-editor/bulk-editor.tsx`                                    | CREATE | Page component (loads project + strings)             |
| `web/src/projects/hooks/use-bulk-editor.ts`                                    | CREATE | State management (dirty tracking, save, filter)      |
| `web/src/projects/components/bulk-translation-editor/bulk-editor-page.tsx`     | CREATE | Main component: header + table + save button         |
| `web/src/projects/components/bulk-translation-editor/bulk-editor-table.tsx`    | CREATE | TanStack Table + Virtual scrolling                   |
| `web/src/projects/components/bulk-translation-editor/bulk-editor-cell.tsx`     | CREATE | Editable cell with keyboard navigation               |
| `web/src/projects/components/bulk-translation-editor/bulk-editor-header.tsx`   | CREATE | Header with breadcrumb, save button, dirty indicator |
| `web/src/projects/components/bulk-translation-editor/bulk-editor-filters.tsx`  | CREATE | Search input + column visibility toggles             |
| `web/src/projects/components/bulk-translation-editor/bulk-editor-progress.tsx` | CREATE | Translation completion progress per locale           |
| `web/src/projects/components/bulk-translation-editor/messages.ts`              | CREATE | react-intl messages for all UI text                  |

### Tests

| File                                                                                      | Action | Purpose                                        |
| ----------------------------------------------------------------------------------------- | ------ | ---------------------------------------------- |
| `web/src/pages/bulk-editor/__tests__/bulk-editor.test.tsx`                                | CREATE | Page-level routing and loading tests           |
| `web/src/projects/components/bulk-translation-editor/__tests__/bulk-editor-page.test.tsx` | CREATE | Component tests for editing, saving, filtering |
| `server/src/web/__tests__/router.test.ts`                                                 | MODIFY | SPA route test for `/projects/:id/bulk-editor` |

## Development Workflow

### Phase 1: Foundation

1. Add SPA route to server + test
2. Add React Router route + lazy page
3. Create basic table with TanStack Table (static, read-only)
4. Wire up `useStrings` hook for data loading

### Phase 2: Editing

5. Implement editable cells with keyboard navigation
6. Add dirty tracking (`useBulkEditor` hook)
7. Wire save button to `upsertTranslations` API
8. Add unsaved changes warning

### Phase 3: Visual Polish

9. Add empty translation visual indicators
10. Add translation progress bar per locale

### Phase 4: Filtering (P3)

11. Add search/filter with URL params
12. Add column visibility toggles

### Phase 5: Performance

13. Add virtual scrolling via TanStack Virtual
14. Test with 1000+ strings

## Verification

After each phase, run:

```bash
just ready
```

## Existing Patterns to Follow

### Hooks (`web/src/projects/hooks/`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';

function useStrings(projectId: string | undefined) {
  return useQuery({
    queryKey: ['strings', projectId],
    queryFn: () => client.strings.listStrings(projectId),
    enabled: !!projectId,
  });
}
```

### Messages (`web/src/projects/components/*/messages.ts`)

```typescript
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  pageTitle: {
    id: 'BULK_EDITOR.PAGE_TITLE',
    defaultMessage: 'Bulk Editor',
  },
  saveButton: {
    id: 'BULK_EDITOR.SAVE_BUTTON',
    defaultMessage: 'Save All Changes',
  },
});

export default messages;
```

### Component Testing (`web/src/projects/components/*/tests/`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test-utils';
import client from '@/api/client';

vi.mock('@/api/client', () => ({
  default: {
    strings: { listStrings: vi.fn() },
    projects: { read: vi.fn(), publishSnapshot: vi.fn() },
  },
}));

describe('BulkEditorPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render string keys as rows', async () => {
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);
    render(<BulkEditorPage projectId="proj_123" />);
    await screen.findByText('welcome_message');
  });
});
```

### Navigation Link

Add a link in `ProjectDetails` component header to navigate to the bulk editor:

```typescript
import { Link } from 'react-router';

<Link to={`/projects/${project.id}/bulk-editor`}>
  <Button variant="outline">
    <FormattedMessage {...messages.bulkEditorLink} />
  </Button>
</Link>
```
