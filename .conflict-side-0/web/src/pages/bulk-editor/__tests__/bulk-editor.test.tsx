import { describe, test, expect, vi, beforeEach } from 'vitest';

import { render, screen } from '@test-utils';
import client from '@/api/client';
import type { ProjectResponse, StringResponse } from '@/generated/api-client/src';
import { BulkEditorPage } from '@/projects/components/bulk-translation-editor/bulk-editor-page';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      read: vi.fn(),
      publishSnapshot: vi.fn(),
    },
    strings: {
      listStrings: vi.fn(),
      upsertTranslations: vi.fn(),
    },
  },
}));

const mockProject: ProjectResponse = {
  id: 'proj_test',
  name: 'Test Project',
  defaultLocale: 'en',
  enabledLocales: ['en', 'fr', 'de'],
  publicReadKey: 'pk_test_123',
};

const mockStrings: StringResponse[] = [
  {
    id: 'str_1',
    key: 'welcome_message',
    context: 'Homepage greeting',
    projectId: 'proj_test',
    translations: { en: 'Welcome', fr: 'Bienvenue', de: 'Willkommen' },
  },
  {
    id: 'str_2',
    key: 'logout_button',
    context: null,
    projectId: 'proj_test',
    translations: { en: 'Log out', fr: '', de: '' },
  },
];

describe('BulkEditor page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should show loading state initially', () => {
    vi.mocked(client.projects.read).mockReturnValue(new Promise(() => {}));
    vi.mocked(client.strings.listStrings).mockReturnValue(new Promise(() => {}));

    render(<BulkEditorPage projectId="proj_test" />);

    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  test('should render string keys as table rows after loading', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByText('welcome_message');
    expect(screen.getByText('logout_button')).toBeDefined();
  });

  test('should render locale columns from project', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByText('welcome_message');
    expect(screen.getByText('en')).toBeDefined();
    expect(screen.getByText('fr')).toBeDefined();
    expect(screen.getByText('de')).toBeDefined();
  });

  test('should show error state when project fails to load', async () => {
    vi.mocked(client.projects.read).mockRejectedValue(new Error('Not found'));
    vi.mocked(client.strings.listStrings).mockResolvedValue([]);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByText(/failed to load project/i);
  });

  test('should show empty state when project has no strings', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue([]);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByText(/no strings found/i);
  });

  test('should render translation values in cells', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByText('Welcome');
    expect(screen.getByText('Bienvenue')).toBeDefined();
    expect(screen.getByText('Willkommen')).toBeDefined();
    expect(screen.getByText('Log out')).toBeDefined();
  });

  test('should render page title', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByRole('heading', { name: /bulk editor/i });
  });

  test('should render project name in header', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);

    render(<BulkEditorPage projectId="proj_test" />);

    await screen.findByText('Test Project');
  });
});
