import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import IntlProvider from '@/translations/intl-provider';
import ConfigurationsContextProvider, {
  type ConfigurationsContextProviderProps,
} from '../context/configurations-context';
import ThemeProvider from '@/theme/provider';

export type DataProvidersProps = React.PropsWithChildren<{ queryClient?: QueryClient }> &
  Omit<ConfigurationsContextProviderProps, 'children'>;

const defaultQueryClient = new QueryClient();

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
