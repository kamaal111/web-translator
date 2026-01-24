import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

import { render, screen } from '@test-utils';
import type { WebTranslatorContext } from '@/context/schemas';
import LoginRequiredLayout from './login-required-layout';

const TestChild = vi.fn(() => <div>Protected Content</div>);

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('LoginRequiredLayout', () => {
  beforeEach(() => {
    TestChild.mockClear();
  });

  test('should NOT render child routes when user is not logged in', () => {
    const context: WebTranslatorContext = {
      current_user: null,
      locale: 'en',
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LoginRequiredLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
      { context, withRouter: false },
    );

    expect(TestChild, 'Child component should NOT have been called/rendered').not.toHaveBeenCalled();
    expect(screen.queryByText('Protected Content')).toBeNull();

    expect(screen.getByText('Login Page'), 'Should have navigated to login page').toBeDefined();
    const location = screen.getByTestId('location');
    expect(location.textContent).toBe('/login');
  });

  test('should render child routes when user is logged in', () => {
    const context: WebTranslatorContext = {
      current_user: { id: '123' },
      locale: 'en',
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LoginRequiredLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
      { context, withRouter: false },
    );

    expect(TestChild, 'Child component SHOULD have been rendered').toHaveBeenCalled();
    expect(screen.getByText('Protected Content')).toBeDefined();
    expect(screen.queryByText('Login Page'), 'Should still be on the home route').toBeNull();
    const location = screen.getByTestId('location');
    expect(location.textContent).toBe('/');
  });

  test('should prevent API calls from child components when not logged in', () => {
    const context: WebTranslatorContext = {
      current_user: null,
      locale: 'en',
    };

    const mockApiCall = vi.fn();
    const ChildWithApiCall = () => {
      mockApiCall();
      return <div>Child with API</div>;
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<LoginRequiredLayout />}>
            <Route path="/" element={<ChildWithApiCall />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>,
      { context, withRouter: false },
    );

    expect(mockApiCall, "API call should NOT have been made because child didn't render").not.toHaveBeenCalled();
    expect(screen.getByText('Login Page'), 'Should have navigated to login').toBeDefined();
  });
});
