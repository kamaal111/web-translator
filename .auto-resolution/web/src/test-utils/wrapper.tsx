import { QueryClient } from '@tanstack/react-query';
import { MemoryRouter, type InitialEntry } from 'react-router';

import DataProviders, { type DataProvidersProps } from '@/data-providers/data-providers';

export interface TestWrapperProps extends DataProvidersProps {
  initialRouterEntries?: InitialEntry[];
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestWrapper({ children, queryClient, context, initialRouterEntries }: TestWrapperProps) {
  const client = queryClient ?? createTestQueryClient();

  return (
    <MemoryRouter initialEntries={initialRouterEntries}>
      <DataProviders queryClient={client} context={context ?? { locale: 'en' }}>
        {children}
      </DataProviders>
    </MemoryRouter>
  );
}
