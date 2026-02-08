import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorResponseSchema } from '@wt/schemas';

import client from '@/api/client';
import { ResponseError, type PublishSnapshotResponse, type ErrorResponse } from '@/generated/api-client/src';

interface UsePublishParams {
  projectId: string;
  onSuccess?: (result: PublishSnapshotResponse) => void;
}

function usePublish({ projectId, onSuccess }: UsePublishParams) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [noChangesError, setNoChangesError] = React.useState<ErrorResponse | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending: isPublishing,
    isError,
    data: publishResult,
  } = useMutation({
    mutationFn: async () => client.projects.publishSnapshot({ projectId, publishSnapshotBody: {} }),
    onSuccess: result => {
      setNoChangesError(null);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['stringVersions'] });
      onSuccess?.(result);
    },
    onError: async (error: unknown) => {
      if (!(error instanceof ResponseError)) {
        return;
      }
      if (error.response.status !== 409) {
        return;
      }

      const json = await error.response.json();
      const errorResponse = ErrorResponseSchema.parse(json);
      setNoChangesError(errorResponse);
    },
  });

  const openDialog = React.useCallback(() => {
    setNoChangesError(null);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setNoChangesError(null);
    setIsDialogOpen(false);
  }, []);

  const handlePublish = React.useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    handlePublish,
    isPublishing,
    isError: isError && !noChangesError,
    noChangesError,
    publishResult,
  };
}

export default usePublish;
