import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import client from '@/api/client';
import type { StringResponse } from '@/generated/api-client/src';

export interface BulkEditorRow {
  stringKey: string;
  context: string | null;
  translations: Record<string, string>;
}

export type DirtyEdits = Map<string, Record<string, string>>;

export function transformStringsToBulkEditorRows(strings: StringResponse[]): BulkEditorRow[] {
  return strings.map(s => ({
    stringKey: s.key,
    context: s.context,
    translations: { ...s.translations },
  }));
}

export function convertDirtyEditsToPayload(dirtyEdits: DirtyEdits) {
  return Array.from(dirtyEdits.entries()).map(([key, translations]) => ({
    key,
    translations,
  }));
}

interface UseBulkEditorParams {
  projectId: string;
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
}

function useBulkEditor({ projectId, onSaveSuccess, onSaveError }: UseBulkEditorParams) {
  const [dirtyEdits, setDirtyEdits] = React.useState<DirtyEdits>(new Map());
  const queryClient = useQueryClient();

  const isDirty = dirtyEdits.size > 0;

  const dirtyCount = React.useMemo(() => {
    let count = 0;
    for (const localeEdits of dirtyEdits.values()) {
      count += Object.keys(localeEdits).length;
    }
    return count;
  }, [dirtyEdits]);

  const updateCell = React.useCallback((stringKey: string, locale: string, value: string) => {
    setDirtyEdits(prev => {
      const next = new Map(prev);
      const existing = next.get(stringKey) ?? {};
      next.set(stringKey, { ...existing, [locale]: value });
      return next;
    });
  }, []);

  const clearEdits = React.useCallback(() => {
    setDirtyEdits(new Map());
  }, []);

  const {
    mutate: save,
    isPending: isSaving,
    isError: isSaveError,
  } = useMutation({
    mutationFn: async () => {
      const translations = convertDirtyEditsToPayload(dirtyEdits);
      return client.strings.upsertTranslations({
        projectId,
        upsertTranslationsPayload: { translations },
      });
    },
    onSuccess: () => {
      clearEdits();
      queryClient.invalidateQueries({ queryKey: ['strings', projectId] });
      onSaveSuccess?.();
    },
    onError: () => {
      onSaveError?.();
    },
  });

  const handleSave = React.useCallback(() => {
    if (!isDirty) return;
    save();
  }, [isDirty, save]);

  const getCellValue = React.useCallback(
    (row: BulkEditorRow, locale: string): string => {
      const dirtyValue = dirtyEdits.get(row.stringKey)?.[locale];
      if (dirtyValue !== undefined) return dirtyValue;
      return row.translations[locale] ?? '';
    },
    [dirtyEdits],
  );

  const isCellDirty = React.useCallback(
    (stringKey: string, locale: string): boolean => {
      return dirtyEdits.get(stringKey)?.[locale] !== undefined;
    },
    [dirtyEdits],
  );

  return {
    dirtyEdits,
    isDirty,
    dirtyCount,
    updateCell,
    clearEdits,
    handleSave,
    isSaving,
    isSaveError,
    getCellValue,
    isCellDirty,
  };
}

export default useBulkEditor;
