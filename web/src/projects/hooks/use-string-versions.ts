import { useQuery } from '@tanstack/react-query';

import client from '@/api/client';
import { is4xxError } from '@/utils/http';

interface UseStringVersionsParams {
  projectId: string | undefined;
  stringKey: string;
  locale?: string;
}

function useStringVersions({ projectId, stringKey, locale }: UseStringVersionsParams) {
  const id = projectId?.trim();
  const key = stringKey.trim();

  const {
    data: versionHistory,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['stringVersions', id, key, locale],
    queryFn: () => {
      if (!id || !key) {
        return null;
      }
      return client.projects.listStringVersions({
        projectId: id,
        stringKey: key,
        locale,
      });
    },
    enabled: Boolean(id) && Boolean(key),
    staleTime: 5 * 60 * 1000, // 5 minutes - version history doesn't change frequently
  });

  return {
    versionHistory,
    isLoading,
    isError,
    is4xxError: is4xxError(error),
  };
}

export default useStringVersions;
