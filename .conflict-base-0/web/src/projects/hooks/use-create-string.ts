import { useMutation, useQueryClient } from '@tanstack/react-query';

import client from '@/api/client';

interface CreateStringInput {
  key: string;
  context?: string;
  translations: Record<string, string>;
}

interface UseCreateStringOptions {
  projectId: string;
  onSuccess?: () => void;
}

function useCreateString({ projectId, onSuccess }: UseCreateStringOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateStringInput) => {
      return client.strings.upsertTranslations({
        projectId,
        upsertTranslationsPayload: {
          translations: [
            {
              key: input.key,
              context: input.context,
              translations: input.translations,
            },
          ],
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strings', projectId] });
      onSuccess?.();
    },
  });

  return {
    createString: mutation.mutate,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

export default useCreateString;
