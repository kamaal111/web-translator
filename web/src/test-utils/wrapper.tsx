import { QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import DataProviders, { type DataProvidersProps } from '@/data-providers/data-providers';

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestWrapper({ children, queryClient, context }: DataProvidersProps) {
  const client = queryClient ?? createTestQueryClient();

  return (
    <BrowserRouter>
      <DataProviders queryClient={client} context={context ?? { locale: 'en' }}>
        {children}
      </DataProviders>
    </BrowserRouter>
  );
}
