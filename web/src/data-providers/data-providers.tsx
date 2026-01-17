import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import IntlProvider from '@/translations/intl-provider';
import ConfigurationsContextProvider from '../context/configurations-context';
import ThemeProvider from '@/theme/provider';

const queryClient = new QueryClient();

function DataProviders({ children }: React.PropsWithChildren) {
  return (
    <IntlProvider>
      <ConfigurationsContextProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ThemeProvider>
      </ConfigurationsContextProvider>
    </IntlProvider>
  );
}

export default DataProviders;
