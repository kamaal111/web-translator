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

    const { container } = render(<StringVersionHistory projectId="proj_test" stringKey="HOME.TITLE" />);

    const skeletons = container.querySelectorAll('.rt-Skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
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

  describe('Version Comparison (Client-side diff)', () => {
    test('should show Compare button when both draft and published version exist', async () => {
      mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

      const { user } = renderComponent();

      await screen.findByText('en');
      const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
      await user.click(enTrigger);

      await screen.findByRole('button', { name: /compare versions/i });
    });

    test('should not show Compare button when draft is null', async () => {
      mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

      const { user } = renderComponent();

      await screen.findByText('es');
      const esTrigger = screen.getByRole('button', { name: /show version history for es/i });
      await user.click(esTrigger);

      await screen.findByText(/no draft translation/i);

      const compareButton = screen.queryByRole('button', { name: /compare versions/i });
      expect(compareButton).toBeNull();
    });

    test('should not show Compare button when no published versions exist', async () => {
      mockListStringVersions.mockResolvedValue({
        locales: [
          {
            locale: 'fr',
            draft: {
              value: 'Bonjour',
              updatedAt: new Date('2024-01-15T10:00:00Z'),
              updatedBy: { id: 'user1', name: 'Test User' },
            },
            versions: [],
            pagination: { page: 1, pageSize: 10, totalVersions: 0, hasMore: false },
          },
        ],
      });

      const { user } = renderComponent();

      await screen.findByText('fr');
      const frTrigger = screen.getByRole('button', { name: /show version history for fr/i });
      await user.click(frTrigger);

      await screen.findByText('Bonjour');

      const compareButton = screen.queryByRole('button', { name: /compare versions/i });
      expect(compareButton).toBeNull();
    });

    test('should display diff comparison when Compare button is clicked', async () => {
      mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

      const { user } = renderComponent();

      await screen.findByText('en');
      const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
      await user.click(enTrigger);

      const compareButton = await screen.findByRole('button', { name: /compare versions/i });
      await user.click(compareButton);

      await screen.findByRole('heading', { name: /changes/i });

      // Verify the diff container exists with comparison content
      const diffContainer = document.querySelector('.version-comparison-diff');
      expect(diffContainer).toBeDefined();
    });

    test('should hide comparison when Close button is clicked', async () => {
      mockListStringVersions.mockResolvedValue(mockStringVersionHistory);

      const { user } = renderComponent();

      await screen.findByText('en');
      const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
      await user.click(enTrigger);

      const compareButton = await screen.findByRole('button', { name: /compare versions/i });
      await user.click(compareButton);

      const changesHeading = await screen.findByRole('heading', { name: /changes/i });
      expect(changesHeading).toBeDefined();

      const closeButton = screen.getByRole('button', { name: /close comparison/i });
      await user.click(closeButton);

      const changesHeadingAfterClose = screen.queryByRole('heading', { name: /changes/i });
      expect(changesHeadingAfterClose).toBeNull();
    });

    test('should display diff segments with correct text for additions', async () => {
      mockListStringVersions.mockResolvedValue({
        locales: [
          {
            locale: 'en',
            draft: {
              value: 'Welcome Home Extra',
              updatedAt: new Date('2024-01-15T10:00:00Z'),
              updatedBy: { id: 'user1', name: 'Test User' },
            },
            versions: [
              {
                version: 1,
                value: 'Welcome Home',
                createdAt: new Date('2024-01-10T10:00:00Z'),
                createdBy: { id: 'user1', name: 'Test User' },
              },
            ],
            pagination: { page: 1, pageSize: 10, totalVersions: 1, hasMore: false },
          },
        ],
      });

      const { user } = renderComponent();

      await screen.findByText('en');
      const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
      await user.click(enTrigger);

      const compareButton = await screen.findByRole('button', { name: /compare versions/i });
      await user.click(compareButton);

      await screen.findByRole('heading', { name: /changes/i });

      const diffContainer = document.querySelector('.version-comparison-diff');
      expect(diffContainer).toBeDefined();

      const additionSegments = diffContainer?.querySelectorAll('.version-comparison-segment.addition');
      expect(additionSegments?.length).toBeGreaterThan(0);
    });

    test('should display diff segments with correct text for deletions', async () => {
      mockListStringVersions.mockResolvedValue({
        locales: [
          {
            locale: 'en',
            draft: {
              value: 'Welcome',
              updatedAt: new Date('2024-01-15T10:00:00Z'),
              updatedBy: { id: 'user1', name: 'Test User' },
            },
            versions: [
              {
                version: 1,
                value: 'Welcome Home Extra',
                createdAt: new Date('2024-01-10T10:00:00Z'),
                createdBy: { id: 'user1', name: 'Test User' },
              },
            ],
            pagination: { page: 1, pageSize: 10, totalVersions: 1, hasMore: false },
          },
        ],
      });

      const { user } = renderComponent();

      await screen.findByText('en');
      const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
      await user.click(enTrigger);

      const compareButton = await screen.findByRole('button', { name: /compare versions/i });
      await user.click(compareButton);

      await screen.findByRole('heading', { name: /changes/i });

      const diffContainer = document.querySelector('.version-comparison-diff');
      expect(diffContainer).toBeDefined();

      const deletionSegments = diffContainer?.querySelectorAll('.version-comparison-segment.deletion');
      expect(deletionSegments?.length).toBeGreaterThan(0);
    });

    test('should use latest version for comparison', async () => {
      mockListStringVersions.mockResolvedValue({
        locales: [
          {
            locale: 'en',
            draft: {
              value: 'New Draft',
              updatedAt: new Date('2024-01-20T10:00:00Z'),
              updatedBy: { id: 'user1', name: 'Test User' },
            },
            versions: [
              {
                version: 3,
                value: 'Latest Version',
                createdAt: new Date('2024-01-15T10:00:00Z'),
                createdBy: { id: 'user1', name: 'Test User' },
              },
              {
                version: 2,
                value: 'Older Version',
                createdAt: new Date('2024-01-10T10:00:00Z'),
                createdBy: { id: 'user1', name: 'Test User' },
              },
            ],
            pagination: { page: 1, pageSize: 10, totalVersions: 2, hasMore: false },
          },
        ],
      });

      const { user } = renderComponent();

      await screen.findByText('en');
      const enTrigger = screen.getByRole('button', { name: /show version history for en/i });
      await user.click(enTrigger);

      const compareButton = await screen.findByRole('button', { name: /compare versions/i });
      await user.click(compareButton);

      await screen.findByRole('heading', { name: /changes/i });

      expect(screen.getByText('v3')).toBeDefined();
    });
  });
});
