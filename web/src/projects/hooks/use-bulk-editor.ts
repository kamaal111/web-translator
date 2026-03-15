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
  context: string;
  translations: Record<string, string>;
}

export function transformStringsToBulkEditorRows(strings: StringResponse[]): BulkEditorRow[] {
  return strings.map(s => ({
    stringKey: s.key,
    context: s.context,
    translations: { ...s.translations },
  }));
}

export function convertDirtyEditsToPayload(dirtyEdits: DirtyEdits, dirtyContexts: Map<string, string | null>) {
  const allKeys = new Set([...dirtyEdits.keys(), ...dirtyContexts.keys()]);

  return Array.from(allKeys).map(key => {
    const entry: { key: string; context?: string | null; translations: Record<string, string> } = {
      key,
      translations: dirtyEdits.get(key) ?? {},
    };
    if (dirtyContexts.has(key)) {
      entry.context = dirtyContexts.get(key);
    }
    return entry;
  });
}

interface UseBulkEditorParams {
  projectId: string;
  rows: BulkEditorRow[];
  existingKeys: string[];
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
  onCreateSuccess?: () => void;
  onCreateError?: () => void;
}

function useBulkEditor({
  projectId,
  rows,
  existingKeys,
  onSaveSuccess,
  onSaveError,
  onCreateSuccess,
  onCreateError,
}: UseBulkEditorParams) {
  const rowsRef = React.useRef<BulkEditorRow[]>(rows);
  React.useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const [dirtyEdits, setDirtyEdits] = React.useState<DirtyEdits>(new Map());
  const [dirtyContexts, setDirtyContexts] = React.useState<Map<string, string | null>>(new Map());
  const [isCreating, setIsCreating] = React.useState(false);
  const [newStringData, setNewStringData] = React.useState<NewStringData>({
    key: '',
    context: '',
    translations: {},
  });
  const [validationError, setValidationError] = React.useState<string>('');
  const queryClient = useQueryClient();

  const isDirty = dirtyEdits.size > 0 || dirtyContexts.size > 0;

  const dirtyCount = React.useMemo(() => {
    let count = 0;
    for (const localeEdits of dirtyEdits.values()) {
      count += Object.keys(localeEdits).length;
    }
    count += dirtyContexts.size;
    return count;
  }, [dirtyEdits, dirtyContexts]);

  const updateCell = React.useCallback((stringKey: string, locale: string, value: string) => {
    setDirtyEdits(prev => {
      const originalRow = rowsRef.current.find(r => r.stringKey === stringKey);
      const originalValue = originalRow?.translations[locale] ?? '';

      const next = new Map(prev);
      const existing = { ...(next.get(stringKey) ?? {}) };

      if (value === originalValue) {
        delete existing[locale];
      } else {
        existing[locale] = value;
      }

      if (Object.keys(existing).length === 0) {
        next.delete(stringKey);
      } else {
        next.set(stringKey, existing);
      }

      return next;
    });
  }, []);

  const updateContext = React.useCallback((stringKey: string, value: string) => {
    setDirtyContexts(prev => {
      const originalRow = rowsRef.current.find(r => r.stringKey === stringKey);
      const originalContext = originalRow?.context ?? null;
      const normalizedValue = value || null;

      const next = new Map(prev);

      if (normalizedValue === originalContext) {
        next.delete(stringKey);
      } else {
        next.set(stringKey, normalizedValue);
      }

      return next;
    });
  }, []);

  const updateContext = React.useCallback((stringKey: string, value: string) => {
    setDirtyContexts(prev => {
      const next = new Map(prev);
      next.set(stringKey, value || null);
      return next;
    });
  }, []);

  const clearEdits = React.useCallback(() => {
    setDirtyEdits(new Map());
    setDirtyContexts(new Map());
  }, []);

  const startCreating = React.useCallback(() => {
    setIsCreating(true);
    setNewStringData({ key: '', context: '', translations: {} });
    setValidationError('');
  }, []);

  const cancelCreating = React.useCallback(() => {
    setIsCreating(false);
    setNewStringData({ key: '', context: '', translations: {} });
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

  const updateNewStringContext = React.useCallback((context: string) => {
    setNewStringData(prev => ({ ...prev, context }));
  }, []);

  const updateNewStringTranslation = React.useCallback((locale: string, value: string) => {
    setNewStringData(prev => ({
      ...prev,
      translations: { ...prev.translations, [locale]: value },
    }));
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

  const updateNewStringContext = React.useCallback((context: string) => {
    setNewStringData(prev => ({ ...prev, context }));
  }, []);

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
      const translations = convertDirtyEditsToPayload(dirtyEdits, dirtyContexts);
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
      const context = newStringData.context.trim() || null;

      return client.strings.upsertTranslations({
        projectId,
        upsertTranslationsPayload: {
          translations: [{ key: newStringData.key, ...(context != null ? { context } : {}), translations }],
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

  const getContextValue = React.useCallback(
    (row: BulkEditorRow): string => {
      if (dirtyContexts.has(row.stringKey)) {
        return dirtyContexts.get(row.stringKey) ?? '';
      }
      return row.context ?? '';
    },
    [dirtyContexts],
  );

  const getContextValue = React.useCallback(
    (row: BulkEditorRow): string => {
      if (dirtyContexts.has(row.stringKey)) {
        return dirtyContexts.get(row.stringKey) ?? '';
      }
      return row.context ?? '';
    },
    [dirtyContexts],
  );

  const isCellDirty = React.useCallback(
    (stringKey: string, locale: string): boolean => {
      return dirtyEdits.get(stringKey)?.[locale] !== undefined;
    },
    [dirtyEdits],
  );

  const isContextDirty = React.useCallback(
    (stringKey: string): boolean => {
      return dirtyContexts.has(stringKey);
    },
    [dirtyContexts],
  );

  return {
    dirtyEdits,
    isDirty,
    dirtyCount,
    updateCell,
    updateContext,
    clearEdits,
    handleSave,
    isSaving,
    isSaveError,
    getCellValue,
    getContextValue,
    isCellDirty,
    isContextDirty,
    isCreating,
    newStringData,
    validationError,
    startCreating,
    cancelCreating,
    updateNewStringKey,
    updateNewStringContext,
    updateNewStringTranslation,
    handleCreateString,
    isCreatingString,
    isCreateError,
  };
}

export default useBulkEditor;
