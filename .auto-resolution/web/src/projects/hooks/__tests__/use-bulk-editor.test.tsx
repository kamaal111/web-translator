import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useBulkEditor, { type BulkEditorRow } from '../use-bulk-editor';

vi.mock('@/api/client', () => ({
  default: {
    strings: {
      upsertTranslations: vi.fn(),
    },
  },
}));

const rows: BulkEditorRow[] = [
  {
    stringKey: 'greeting',
    context: 'Homepage greeting',
    translations: { en: 'Hello', fr: 'Bonjour' },
  },
  {
    stringKey: 'farewell',
    context: null,
    translations: { en: 'Goodbye' },
  },
];

function BulkEditorTestWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function renderBulkEditor(overrideRows?: BulkEditorRow[]) {
  return renderHook(
    () =>
      useBulkEditor({
        projectId: 'proj_1',
        rows: overrideRows ?? rows,
        existingKeys: rows.map(r => r.stringKey),
      }),
    { wrapper: BulkEditorTestWrapper },
  );
}

describe('useBulkEditor dirty cell detection', () => {
  test('marks cell dirty when value differs from original', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateCell('greeting', 'en', 'Hi'));

    expect(result.current.isCellDirty('greeting', 'en')).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.dirtyCount).toBe(1);
  });

  test('removes dirty state when cell value reverts to original', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateCell('greeting', 'en', 'Hi'));
    expect(result.current.isCellDirty('greeting', 'en')).toBe(true);

    act(() => result.current.updateCell('greeting', 'en', 'Hello'));

    expect(result.current.isCellDirty('greeting', 'en')).toBe(false);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.dirtyCount).toBe(0);
  });

  test('removes key from dirty map when all locales for a key revert', () => {
    const { result } = renderBulkEditor();

    act(() => {
      result.current.updateCell('greeting', 'en', 'Hi');
      result.current.updateCell('greeting', 'fr', 'Salut');
    });
    expect(result.current.dirtyCount).toBe(2);

    act(() => result.current.updateCell('greeting', 'en', 'Hello'));
    expect(result.current.dirtyCount).toBe(1);
    expect(result.current.isCellDirty('greeting', 'en')).toBe(false);
    expect(result.current.isCellDirty('greeting', 'fr')).toBe(true);

    act(() => result.current.updateCell('greeting', 'fr', 'Bonjour'));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.dirtyCount).toBe(0);
  });

  test('keeps other locales dirty when only one reverts', () => {
    const { result } = renderBulkEditor();

    act(() => {
      result.current.updateCell('greeting', 'en', 'Hi');
      result.current.updateCell('greeting', 'fr', 'Salut');
    });

    act(() => result.current.updateCell('greeting', 'en', 'Hello'));

    expect(result.current.isCellDirty('greeting', 'en')).toBe(false);
    expect(result.current.isCellDirty('greeting', 'fr')).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.dirtyCount).toBe(1);
  });

  test('treats missing original translation as empty string', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateCell('greeting', 'de', 'Hallo'));
    expect(result.current.isCellDirty('greeting', 'de')).toBe(true);

    act(() => result.current.updateCell('greeting', 'de', ''));
    expect(result.current.isCellDirty('greeting', 'de')).toBe(false);
  });

  test('multiple keys can be independently dirty and reverted', () => {
    const { result } = renderBulkEditor();

    act(() => {
      result.current.updateCell('greeting', 'en', 'Hi');
      result.current.updateCell('farewell', 'en', 'See ya');
    });
    expect(result.current.dirtyCount).toBe(2);

    act(() => result.current.updateCell('greeting', 'en', 'Hello'));

    expect(result.current.isCellDirty('greeting', 'en')).toBe(false);
    expect(result.current.isCellDirty('farewell', 'en')).toBe(true);
    expect(result.current.dirtyCount).toBe(1);
  });
});

describe('useBulkEditor dirty context detection', () => {
  test('marks context dirty when value differs from original', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateContext('greeting', 'New context'));

    expect(result.current.isContextDirty('greeting')).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.dirtyCount).toBe(1);
  });

  test('removes dirty state when context reverts to original', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateContext('greeting', 'New context'));
    expect(result.current.isContextDirty('greeting')).toBe(true);

    act(() => result.current.updateContext('greeting', 'Homepage greeting'));

    expect(result.current.isContextDirty('greeting')).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  test('treats empty string and null original context as equivalent when reverting', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateContext('farewell', 'Some context'));
    expect(result.current.isContextDirty('farewell')).toBe(true);

    act(() => result.current.updateContext('farewell', ''));

    expect(result.current.isContextDirty('farewell')).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  test('treats empty string input as null when original is null', () => {
    const { result } = renderBulkEditor();

    act(() => result.current.updateContext('farewell', ''));

    expect(result.current.isContextDirty('farewell')).toBe(false);
  });
});

describe('useBulkEditor dirtyCount with mixed edits', () => {
  test('counts cells and contexts independently', () => {
    const { result } = renderBulkEditor();

    act(() => {
      result.current.updateCell('greeting', 'en', 'Hi');
      result.current.updateContext('farewell', 'Closing message');
    });

    expect(result.current.dirtyCount).toBe(2);
    expect(result.current.isDirty).toBe(true);
  });

  test('dirtyCount reaches zero when all edits are reverted', () => {
    const { result } = renderBulkEditor();

    act(() => {
      result.current.updateCell('greeting', 'en', 'Hi');
      result.current.updateContext('farewell', 'Closing message');
    });

    act(() => {
      result.current.updateCell('greeting', 'en', 'Hello');
      result.current.updateContext('farewell', '');
    });

    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.isDirty).toBe(false);
  });
});
