import { useMutation, useQueryClient } from '@tanstack/react-query';

import client from '@/api/client';

type UseCreateProjectOptions = {
  onSuccess?: () => void;
};

function useCreateProject(options?: UseCreateProjectOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: client.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      options?.onSuccess?.();
    },
  });

  return {
    createProject: mutation.mutate,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

export default useCreateProject;
