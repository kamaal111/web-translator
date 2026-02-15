import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import IntlProvider from '@/translations/intl-provider';
import ConfigurationsContextProvider, {
  type ConfigurationsContextProviderProps,
} from '../context/configurations-context';
import ThemeProvider from '@/theme/provider';
import { is4xxError } from '@/utils/http';

const RETRIES = 3;

export type DataProvidersProps = React.PropsWithChildren<{ queryClient?: QueryClient }> &
  Omit<ConfigurationsContextProviderProps, 'children'>;

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (is4xxError(error)) {
          return false;
        }

        return failureCount < RETRIES;
      },
      // Exponential backoff: 1s (attempt 0), 2s (attempt 1), 4s (attempt 2), capped at 30s
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function DataProviders({ children, queryClient, context }: DataProvidersProps) {
  return (
    <ConfigurationsContextProvider context={context}>
      <IntlProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient ?? defaultQueryClient}>{children}</QueryClientProvider>
        </ThemeProvider>
      </IntlProvider>
    </ConfigurationsContextProvider>
  );
}

export default DataProviders;
