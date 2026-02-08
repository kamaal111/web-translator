import { useQuery } from '@tanstack/react-query';

import client from '@/api/client';
import type { StringResponse } from '@/generated/api-client/src';
import { is4xxError } from '@/utils/http';

function useStrings(projectId: string | undefined) {
  const id = projectId?.trim();

  const {
    data: strings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['strings', id],
    queryFn: (): Promise<StringResponse[]> => {
      if (!id) {
        return Promise.resolve([]);
      }

      return client.strings.listStrings(id);
    },
    enabled: Boolean(id),
  });

  return { strings: strings ?? [], isLoading, isError, is4xxError: is4xxError(error) };
}

export default useStrings;
