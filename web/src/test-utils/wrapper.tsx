import { QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import DataProviders, { type DataProvidersProps } from '@/data-providers/data-providers';

export interface TestWrapperProps extends DataProvidersProps {
  withRouter?: boolean;
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestWrapper({ children, queryClient, context, withRouter }: TestWrapperProps) {
  const client = queryClient ?? createTestQueryClient();

  if (withRouter === false) {
    return (
      <DataProviders queryClient={client} context={context ?? { locale: 'en' }}>
        {children}
      </DataProviders>
    );
  }

  return (
    <BrowserRouter>
      <DataProviders queryClient={client} context={context ?? { locale: 'en' }}>
        {children}
      </DataProviders>
    </BrowserRouter>
  );
}
