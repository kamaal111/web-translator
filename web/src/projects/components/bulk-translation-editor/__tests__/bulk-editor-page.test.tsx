import { describe, test, expect, vi, beforeEach } from 'vitest';

import { render, screen, userEvent } from '@test-utils';
import client from '@/api/client';
import type { ProjectResponse, StringResponse } from '@/generated/api-client/src';
import { BulkEditorPage } from '../bulk-editor-page';

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

vi.mock('react-hot-toast', async importOriginal => {
  const actual = await importOriginal<typeof import('react-hot-toast')>();
  return {
    ...actual,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

const mockProject: ProjectResponse = {
  id: 'proj_test',
  name: 'Test Project',
  defaultLocale: 'en',
  enabledLocales: ['en', 'fr'],
  publicReadKey: 'pk_test_123',
};

const mockStrings: StringResponse[] = [
  {
    id: 'str_1',
    key: 'welcome_message',
    context: 'Homepage greeting',
    projectId: 'proj_test',
    translations: { en: 'Welcome', fr: 'Bienvenue' },
  },
  {
    id: 'str_2',
    key: 'logout_button',
    context: null,
    projectId: 'proj_test',
    translations: { en: 'Log out', fr: '' },
  },
];

describe('BulkEditorPage component', () => {
  const mockUpsertTranslations = vi.mocked(client.strings.upsertTranslations);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);
    vi.mocked(client.strings.listStrings).mockResolvedValue(mockStrings);
    mockUpsertTranslations.mockResolvedValue({ updatedCount: 1 });
  });

  const renderComponent = () => {
    render(<BulkEditorPage projectId="proj_test" />);
    return { user: userEvent };
  };

  test('should render save button as disabled when no edits', async () => {
    renderComponent();

    const saveButton = await screen.findByRole('button', { name: /save all changes/i });
    expect(saveButton.hasAttribute('disabled')).toBe(true);
  });

  test('should enable save button after editing a cell', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);

    const textarea = await screen.findByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Hello');
    await user.tab();

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    expect(saveButton.hasAttribute('disabled')).toBe(false);
  });

  test('should show unsaved changes count after editing', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);

    const textarea = await screen.findByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Hello');
    await user.tab();

    await screen.findByText(/1 unsaved change/i);
  });

  test('should call upsertTranslations API on save', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);

    const textarea = await screen.findByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Hello');
    await user.tab();

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    await user.click(saveButton);

    expect(mockUpsertTranslations).toHaveBeenCalledWith({
      projectId: 'proj_test',
      upsertTranslationsPayload: {
        translations: [
          {
            key: 'welcome_message',
            translations: { en: 'Hello' },
          },
        ],
      },
    });
  });

  test('should clear dirty state after successful save', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);

    const textarea = await screen.findByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Hello');
    await user.tab();

    const saveButton = screen.getByRole('button', { name: /save all changes/i });
    await user.click(saveButton);

    await vi.waitFor(() => {
      expect(saveButton.hasAttribute('disabled')).toBe(true);
    });
  });

  test('should render publish button', async () => {
    renderComponent();

    await screen.findByText('Welcome');
    const publishButton = screen.getByRole('button', { name: /publish/i });
    expect(publishButton).toBeDefined();
  });

  test('should allow editing by clicking a cell', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);

    const textarea = await screen.findByRole('textbox');
    expect(textarea).toBeDefined();
  });

  test('should enter edit mode when pressing Enter on a cell', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    welcomeCell.focus();
    await user.keyboard('{Enter}');

    const textarea = await screen.findByRole('textbox');
    expect(textarea).toBeDefined();
  });

  test('should exit edit mode when pressing Escape', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');
    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);

    await screen.findByRole('textbox');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('textbox')).toBeNull();
  });

  test('should track multiple edits across different cells', async () => {
    const { user } = renderComponent();

    await screen.findByText('Welcome');

    const welcomeCell = screen.getByText('Welcome');
    await user.click(welcomeCell);
    const firstTextarea = await screen.findByRole('textbox');
    await user.clear(firstTextarea);
    await user.type(firstTextarea, 'Hello');
    await user.tab();

    const bienvenueCell = screen.getByText('Bienvenue');
    await user.click(bienvenueCell);
    const secondTextarea = await screen.findByRole('textbox');
    await user.clear(secondTextarea);
    await user.type(secondTextarea, 'Salut');
    await user.tab();

    await screen.findByText(/2 unsaved changes/i);
  });

  test('should render back to project link', async () => {
    renderComponent();

    await screen.findByText('Test Project');
    const backLink = screen.getByRole('link', { name: /back to project/i });
    expect(backLink).toBeDefined();
  });

  describe('String Creation', () => {
    test('should show Add String button', async () => {
      renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      expect(addButton).toBeDefined();
    });

    test('should show creation row when Add String is clicked', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      expect(keyInput).toBeDefined();
    });

    test('should allow entering data in creation row', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'new_key');

      const enInput = screen.getByPlaceholderText(/translation for en/i);
      await user.type(enInput, 'New English');

      const frInput = screen.getByPlaceholderText(/translation for fr/i);
      await user.type(frInput, 'Nouveau Français');

      expect(keyInput).toHaveProperty('value', 'new_key');
      expect(enInput).toHaveProperty('value', 'New English');
      expect(frInput).toHaveProperty('value', 'Nouveau Français');
    });

    test('should save new string via upsertTranslations API', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'new_key');

      const enInput = screen.getByPlaceholderText(/translation for en/i);
      await user.type(enInput, 'New English');

      const saveNewButton = screen.getByRole('button', { name: /save string/i });
      await user.click(saveNewButton);

      expect(mockUpsertTranslations).toHaveBeenCalledWith({
        projectId: 'proj_test',
        upsertTranslationsPayload: {
          translations: [
            {
              key: 'new_key',
              translations: { en: 'New English' },
            },
          ],
        },
      });
    });

    test('should show validation error for duplicate key', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'welcome_message');

      await screen.findByText(/key already exists/i);
    });

    test('should show validation error for empty key', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const enInput = screen.getByPlaceholderText(/translation for en/i);
      await user.type(enInput, 'Some text');

      const saveNewButton = screen.getByRole('button', { name: /save string/i });
      await user.click(saveNewButton);

      await screen.findByText(/key is required/i);
    });

    test('should cancel creation when Escape is pressed', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'new_key');
      await user.keyboard('{Escape}');

      expect(screen.queryByPlaceholderText(/enter string key/i)).toBeNull();
    });

    test('should hide creation row after successful save', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'new_key');

      const enInput = screen.getByPlaceholderText(/translation for en/i);
      await user.type(enInput, 'New English');

      const saveNewButton = screen.getByRole('button', { name: /save string/i });
      await user.click(saveNewButton);

      await vi.waitFor(() => {
        expect(screen.queryByPlaceholderText(/enter string key/i)).toBeNull();
      });
    });
  });

  describe('Context column', () => {
    test('should render context column header', async () => {
      renderComponent();

      await screen.findByText('Welcome');
      expect(screen.getByText('Context')).toBeDefined();
    });

    test('should display existing context value', async () => {
      renderComponent();

      await screen.findByText('Homepage greeting');
      expect(screen.getByText('Homepage greeting')).toBeDefined();
    });

    test('should allow editing context by clicking on context cell', async () => {
      const { user } = renderComponent();

      await screen.findByText('Homepage greeting');
      const contextCell = screen.getByText('Homepage greeting');
      await user.click(contextCell);

      const textarea = await screen.findByRole('textbox');
      expect(textarea).toBeDefined();
    });

    test('should include context in save payload when context is edited', async () => {
      const { user } = renderComponent();

      await screen.findByText('Homepage greeting');
      const contextCell = screen.getByText('Homepage greeting');
      await user.click(contextCell);

      const textarea = await screen.findByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Updated context');
      await user.tab();

      const saveButton = screen.getByRole('button', { name: /save all changes/i });
      await user.click(saveButton);

      expect(mockUpsertTranslations).toHaveBeenCalledWith({
        projectId: 'proj_test',
        upsertTranslationsPayload: {
          translations: [
            {
              key: 'welcome_message',
              context: 'Updated context',
              translations: {},
            },
          ],
        },
      });
    });

    test('should count context edit in unsaved changes count', async () => {
      const { user } = renderComponent();

      await screen.findByText('Homepage greeting');
      const contextCell = screen.getByText('Homepage greeting');
      await user.click(contextCell);

      const textarea = await screen.findByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'New context');
      await user.tab();

      await screen.findByText(/1 unsaved change/i);
    });
  });

  describe('Context in String Creation', () => {
    test('should show context input in creation row', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const contextInput = await screen.findByPlaceholderText(/optional context/i);
      expect(contextInput).toBeDefined();
    });

    test('should include context in create string API call when provided', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'new_key');

      const contextInput = screen.getByPlaceholderText(/optional context/i);
      await user.type(contextInput, 'My context');

      const enInput = screen.getByPlaceholderText(/translation for en/i);
      await user.type(enInput, 'New English');

      const saveNewButton = screen.getByRole('button', { name: /save string/i });
      await user.click(saveNewButton);

      expect(mockUpsertTranslations).toHaveBeenCalledWith({
        projectId: 'proj_test',
        upsertTranslationsPayload: {
          translations: [
            {
              key: 'new_key',
              context: 'My context',
              translations: { en: 'New English' },
            },
          ],
        },
      });
    });

    test('should not include context in create string API call when context is empty', async () => {
      const { user } = renderComponent();

      await screen.findByText('Welcome');
      const addButton = screen.getByRole('button', { name: /add string/i });
      await user.click(addButton);

      const keyInput = await screen.findByPlaceholderText(/enter string key/i);
      await user.type(keyInput, 'new_key');

      const saveNewButton = screen.getByRole('button', { name: /save string/i });
      await user.click(saveNewButton);

      expect(mockUpsertTranslations).toHaveBeenCalledWith({
        projectId: 'proj_test',
        upsertTranslationsPayload: {
          translations: [
            {
              key: 'new_key',
              translations: {},
            },
          ],
        },
      });
    });
  });
});
