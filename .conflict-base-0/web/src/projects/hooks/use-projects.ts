import { useQuery } from '@tanstack/react-query';

import client from '@/api/client';

const TIMEOUT = 10_000; // 10 seconds

function useProjects() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async ({ signal }) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      if (signal?.aborted) {
        clearTimeout(timeoutId);
        throw new Error('Query cancelled');
      }

      try {
        return await client.projects.list();
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Request timeout - could not fetch projects');
        }

        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },
  });

  return {
    projects: data ?? [],
    isLoading,
    error,
    isError,
  };
}

export default useProjects;
