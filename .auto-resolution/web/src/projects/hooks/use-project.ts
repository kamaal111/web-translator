import { useQuery } from '@tanstack/react-query';

import client from '@/api/client';
import { is4xxError } from '@/utils/http';

function useProject(rawId: string | undefined) {
  const id = rawId?.trim();
  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => {
      if (!id) {
        return null;
      }
      return client.projects.read(id);
    },
    enabled: Boolean(id),
  });

  return { project, isLoading, isError, is4xxError: is4xxError(error) };
}

export default useProject;
