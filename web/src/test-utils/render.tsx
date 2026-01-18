import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';

import { TestWrapper } from './wrapper';

function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
) {
  const { queryClient, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: ({ children }) => <TestWrapper queryClient={queryClient}>{children}</TestWrapper>,
    ...renderOptions,
  });
}

export { renderWithProviders as render };
