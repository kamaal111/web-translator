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

export interface NewStringData {
  key: string;
  translations: Record<string, string>;
}

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
  existingKeys: string[];
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
  onCreateSuccess?: () => void;
  onCreateError?: () => void;
}

function useBulkEditor({
  projectId,
  existingKeys,
  onSaveSuccess,
  onSaveError,
  onCreateSuccess,
  onCreateError,
}: UseBulkEditorParams) {
  const [dirtyEdits, setDirtyEdits] = React.useState<DirtyEdits>(new Map());
  const [isCreating, setIsCreating] = React.useState(false);
  const [newStringData, setNewStringData] = React.useState<NewStringData>({
    key: '',
    translations: {},
  });
  const [validationError, setValidationError] = React.useState<string>('');
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

  const startCreating = React.useCallback(() => {
    setIsCreating(true);
    setNewStringData({ key: '', translations: {} });
    setValidationError('');
  }, []);

  const cancelCreating = React.useCallback(() => {
    setIsCreating(false);
    setNewStringData({ key: '', translations: {} });
    setValidationError('');
  }, []);

  const updateNewStringKey = React.useCallback(
    (key: string) => {
      setNewStringData(prev => ({ ...prev, key }));
      if (key && existingKeys.includes(key)) {
        setValidationError('keyAlreadyExists');
      } else {
        setValidationError('');
      }
    },
    [existingKeys],
  );

  const updateNewStringTranslation = React.useCallback((locale: string, value: string) => {
    setNewStringData(prev => ({
      ...prev,
      translations: { ...prev.translations, [locale]: value },
    }));
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

  const {
    mutate: createString,
    isPending: isCreatingString,
    isError: isCreateError,
  } = useMutation({
    mutationFn: async () => {
      if (!newStringData.key.trim()) {
        throw new Error('keyIsRequired');
      }
      if (existingKeys.includes(newStringData.key)) {
        throw new Error('keyAlreadyExists');
      }

      const translations = Object.keys(newStringData.translations).length > 0 ? newStringData.translations : {};

      return client.strings.upsertTranslations({
        projectId,
        upsertTranslationsPayload: {
          translations: [{ key: newStringData.key, translations }],
        },
      });
    },
    onSuccess: () => {
      cancelCreating();
      queryClient.invalidateQueries({ queryKey: ['strings', projectId] });
      onCreateSuccess?.();
    },
    onError: error => {
      const errorMessage = error instanceof Error ? error.message : 'stringCreationFailed';
      setValidationError(errorMessage);
      onCreateError?.();
    },
  });

  const handleSave = React.useCallback(() => {
    if (!isDirty) return;
    save();
  }, [isDirty, save]);

  const handleCreateString = React.useCallback(() => {
    if (!newStringData.key.trim()) {
      setValidationError('keyIsRequired');
      return;
    }
    if (existingKeys.includes(newStringData.key)) {
      setValidationError('keyAlreadyExists');
      return;
    }
    createString();
  }, [newStringData.key, existingKeys, createString]);

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
    isCreating,
    newStringData,
    validationError,
    startCreating,
    cancelCreating,
    updateNewStringKey,
    updateNewStringTranslation,
    handleCreateString,
    isCreatingString,
    isCreateError,
  };
}

export default useBulkEditor;
