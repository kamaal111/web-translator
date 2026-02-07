import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@test-utils';

import StringVersionHistory from './string-version-history';
import client from '@/api/client';
import { mockStringVersionHistory } from './samples';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      listStringVersions: vi.fn(),
    },
  },
}));

describe('StringVersionHistory', () => {
  const mockListStringVersions = vi.mocked(client.projects.listStringVersions);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (projectId: string = 'proj_test', stringKey: string = 'HOME.TITLE') => {
    render(<StringVersionHistory projectId={projectId} stringKey={stringKey} />);

    return { user: userEvent };
  };

  test('should render loading state initially', () => {
    mockListStringVersions.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText(/loading version history/i)).toBeDefined();
  });

  test('should render version history title with string key', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    renderComponent();

    await screen.findByText('HOME.TITLE');

    expect(screen.getByRole('heading', { name: /version history/i })).toBeDefined();
  });

  test('should render locale accordion items', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    renderComponent();

    await screen.findByText('en');

    expect(screen.getByText('es')).toBeDefined();
  });

  test('should render draft section for locale with draft', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    const { user } = renderComponent();

    await screen.findByText('en');

    const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
    await user.click(enTrigger);

    await screen.findByText('Welcome Home - Draft');
  });

  test('should render published versions with version numbers', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    const { user } = renderComponent();

    await screen.findByText('en');

    const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
    await user.click(enTrigger);

    await screen.findByText('Welcome Home v2');

    expect(screen.getByText('Welcome Home v1')).toBeDefined();
    expect(screen.getByText('v2')).toBeDefined();
    expect(screen.getByText('v1')).toBeDefined();
  });

  test('should render "No draft translation" when draft is null', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    const { user } = renderComponent();

    await screen.findByText('es');

    const esTrigger = screen.getByRole('button', { name: /show version history for es/i });
    await user.click(esTrigger);

    await screen.findByText(/no draft translation/i);
  });

  test('should render error message when fetch fails', async () => {
    mockListStringVersions.mockRejectedValue(new Error('Failed to fetch'));

    renderComponent();

    await screen.findByText(/failed to load version history/i);
  });

  test('should render "No versions found" when locales array is empty', async () => {
    mockListStringVersions.mockResolvedValue({
      locales: [],
    });

    renderComponent();

    await screen.findByText(/no versions found/i);
  });

  test('should call API with correct parameters', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    renderComponent('proj_123', 'BUTTON.SUBMIT');

    await screen.findByText('en');

    expect(mockListStringVersions).toHaveBeenCalledWith({
      projectId: 'proj_123',
      stringKey: 'BUTTON.SUBMIT',
      locale: undefined,
    });
  });

  test('should display author information in version items', async () => {
    mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

    const { user } = renderComponent();

    await screen.findByText('en');
    const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
    await user.click(enTrigger);

    const byTheUserElements = await screen.findAllByText(/by test user/i);

    expect(byTheUserElements.length).toBeGreaterThan(0);
  });
});
