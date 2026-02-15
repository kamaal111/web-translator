import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConflictErrorResponseSchema, type ConflictErrorResponse } from '@wt/schemas';

import client from '@/api/client';
import { ResponseError } from '@/generated/api-client/src';

interface UseDraftEditorParams {
  projectId: string;
  stringKey: string;
  locale: string;
  initialValue: string;
  updatedAt: string;
  onSave?: () => void;
  onCancel?: () => void;
}

function useDraftEditor({
  projectId,
  stringKey,
  locale,
  initialValue,
  updatedAt,
  onSave,
  onCancel,
}: UseDraftEditorParams) {
  const [value, setValue] = useState(initialValue);
  const [conflictError, setConflictError] = useState<ConflictErrorResponse | null>(null);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ forceSave = false }: { forceSave?: boolean } = {}) => {
      const response = await client.projects.updateDraftTranslations({
        projectId,
        stringKey,
        updateDraftTranslationsBody: {
          translations: {
            [locale]: value,
          },
          ifUnmodifiedSince: forceSave ? undefined : new Date(updatedAt),
        },
      });

      return response;
    },
    onSuccess: () => {
      setConflictError(null);
      // Invalidate version history query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['stringVersions', projectId, stringKey] });
      // Invalidate any comparison queries for this string since draft value changed
      queryClient.invalidateQueries({ queryKey: ['versionComparison', projectId, stringKey] });
      onSave?.();
    },
    onError: async (error: unknown) => {
      // Check if it's a 409 conflict error from the API
      if (error instanceof ResponseError && error.response.status === 409) {
        const json = await error.response.json();
        const parseResult = ConflictErrorResponseSchema.safeParse(json);
        if (parseResult.success) {
          setConflictError(parseResult.data);
        }
      }
    },
  });

  // Extract the mutate function to avoid referential instability warnings
  const { mutate } = updateMutation;

  const handleSave = useCallback(() => {
    mutate({ forceSave: false });
  }, [mutate]);

  const handleForceSave = useCallback(() => {
    mutate({ forceSave: true });
  }, [mutate]);

  const handleCancel = useCallback(() => {
    setValue(initialValue);
    setConflictError(null);
    onCancel?.();
  }, [initialValue, onCancel]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setConflictError(null);
  }, []);

  const isDirty = value !== initialValue;
  const isEmpty = value.trim() === '';
  const canSave = isDirty && !isEmpty && !updateMutation.isPending;

  return {
    value,
    setValue: handleChange,
    handleSave,
    handleForceSave,
    handleCancel,
    isSaving: updateMutation.isPending,
    isError: updateMutation.isError,
    error: updateMutation.error,
    conflictError,
    isDirty,
    isEmpty,
    canSave,
  };
}

export default useDraftEditor;
