import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@test-utils';

import StringsList from './strings-list';
import client from '@/api/client';
import { mockStrings, mockEmptyStrings } from './samples';

vi.mock('@/api/client', () => ({
  default: {
    strings: {
      listStrings: vi.fn(),
    },
    projects: {
      listStringVersions: vi.fn(),
    },
  },
}));

describe('StringsList', () => {
  const mockListStrings = vi.mocked(client.strings.listStrings);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (projectId: string = 'proj_test') => {
    render(<StringsList projectId={projectId} />);

    return { user: userEvent };
  };

  test('should render loading state initially', () => {
    mockListStrings.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText(/loading strings/i)).toBeDefined();
  });

  test('should render strings list title', async () => {
    mockListStrings.mockResolvedValue(mockStrings);

    renderComponent();

    await screen.findByRole('heading', { name: /strings/i });
  });

  test('should render string keys', async () => {
    mockListStrings.mockResolvedValue(mockStrings);

    renderComponent();

    await screen.findByText('HOME.TITLE');
    expect(screen.getByText('HOME.SUBTITLE')).toBeDefined();
    expect(screen.getByText('NAV.LOGOUT')).toBeDefined();
  });

  test('should render context badges for strings that have context', async () => {
    mockListStrings.mockResolvedValue(mockStrings);

    renderComponent();

    await screen.findByText('Main page heading');
    expect(screen.getByText('Navigation logout button')).toBeDefined();
  });

  test('should render empty state when no strings exist', async () => {
    mockListStrings.mockResolvedValue(mockEmptyStrings);

    renderComponent();

    await screen.findByText(/no strings found/i);
  });

  test('should render error state on fetch failure', async () => {
    mockListStrings.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await screen.findByText(/failed to load strings/i);
  });

  test('should expand string item to show translations', async () => {
    mockListStrings.mockResolvedValue(mockStrings);

    const { user } = renderComponent();

    const trigger = await screen.findByLabelText(/expand string HOME\.TITLE/i);
    await user.click(trigger);

    expect(screen.getByText('en:')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('es:')).toBeDefined();
    expect(screen.getByText('Inicio')).toBeDefined();
    expect(screen.getByText('fr:')).toBeDefined();
    expect(screen.getByText('Accueil')).toBeDefined();
    expect(screen.getByText(/show version history/i)).toBeDefined();
  });

  test('should render accordion triggers for each string', async () => {
    mockListStrings.mockResolvedValue(mockStrings);

    renderComponent();

    await screen.findByLabelText(/expand string HOME\.TITLE/i);
    expect(screen.getByLabelText(/expand string HOME\.SUBTITLE/i)).toBeDefined();
    expect(screen.getByLabelText(/expand string NAV\.LOGOUT/i)).toBeDefined();
  });
});
