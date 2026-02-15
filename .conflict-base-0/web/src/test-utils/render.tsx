import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';

import { TestWrapper, type TestWrapperProps } from './wrapper';

function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'> & TestWrapperProps) {
  const { queryClient, context, initialRouterEntries, ...renderOptions } = options ?? {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper initialRouterEntries={initialRouterEntries} queryClient={queryClient} context={context}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
}

export { renderWithProviders as render };
