import { describe, test, expect, vi, beforeEach } from 'vitest';

import { render, screen, userEvent } from '@test-utils';
import { ResponseError } from '@/generated/api-client/src';

import DraftEditor from './draft-editor';
import client from '@/api/client';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      updateDraftTranslations: vi.fn(),
    },
  },
}));

describe('DraftEditor', () => {
  const mockUpdateDraftTranslations = vi.mocked(client.projects.updateDraftTranslations);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    projectId: 'proj_test',
    stringKey: 'HOME.TITLE',
    locale: 'en',
    initialValue: 'Welcome',
    updatedAt: '2026-02-01T10:00:00Z',
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  const renderComponent = (props = defaultProps) => {
    render(<DraftEditor {...props} />);

    return { user: userEvent };
  };

  test('should render textarea with initial value', () => {
    renderComponent();

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: /edit draft translation/i,
    });
    expect(textarea).toBeDefined();
    expect(textarea.value).toBe('Welcome');
  });

  test('should enable save button when text is changed', async () => {
    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole<HTMLButtonElement>('button', { name: /save/i });

    // Initially disabled (or enabled depending on implementation)
    await user.clear(textarea);
    await user.type(textarea, 'New Welcome Message');

    expect(saveButton.disabled).toBe(false);
  });

  test('should call onSave with new value when save button is clicked', async () => {
    mockUpdateDraftTranslations.mockResolvedValue({
      updated: [
        {
          locale: 'en',
          value: 'New Welcome Message',
          updatedAt: new Date('2026-02-01T11:00:00Z'),
          updatedBy: {
            id: 'user_123',
            name: 'Test User',
          },
        },
      ],
    });

    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.clear(textarea);
    await user.type(textarea, 'New Welcome Message');
    await user.click(saveButton);

    expect(mockUpdateDraftTranslations).toHaveBeenCalledWith({
      projectId: 'proj_test',
      stringKey: 'HOME.TITLE',
      updateDraftTranslationsBody: {
        translations: {
          en: 'New Welcome Message',
        },
        ifUnmodifiedSince: new Date('2026-02-01T10:00:00Z'),
      },
    });
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  test('should call onCancel when cancel button is clicked', async () => {
    const { user } = renderComponent();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  test('should reset textarea to initial value when cancel is clicked', async () => {
    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', {
      name: /edit draft translation/i,
    }) as HTMLTextAreaElement;
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    await user.clear(textarea);
    await user.type(textarea, 'Changed text');
    expect(textarea.value).toBe('Changed text');

    await user.click(cancelButton);

    expect(textarea.value).toBe('Welcome');
  });

  test('should display loading state while saving', async () => {
    mockUpdateDraftTranslations.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.clear(textarea);
    await user.type(textarea, 'New text');
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDefined();
  });

  test('should not allow empty values', async () => {
    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole('button', { name: /save/i }) as HTMLButtonElement;

    await user.clear(textarea);

    expect(saveButton.disabled).toBe(true);
  });

  test('should display error message when save fails', async () => {
    mockUpdateDraftTranslations.mockRejectedValue(new Error('Network error'));

    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.clear(textarea);
    await user.type(textarea, 'New text');
    await user.click(saveButton);

    await screen.findByText(/failed to save/i);
  });

  test('should display conflict warning when 409 is returned', async () => {
    const conflictResponse = new Response(
      JSON.stringify({
        message: 'Concurrent modification detected',
        context: {
          conflictDetails: {
            locale: 'en',
            lastModifiedAt: '2026-02-01T10:55:00Z',
            lastModifiedBy: {
              id: 'user_456',
              name: 'Bob Translator',
            },
          },
        },
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );

    mockUpdateDraftTranslations.mockRejectedValue(new ResponseError(conflictResponse));

    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.clear(textarea);
    await user.type(textarea, 'New text');
    await user.click(saveButton);

    await screen.findByText(/concurrent modification/i);
    expect(screen.getByText(/bob translator/i)).toBeDefined();
  });

  test('should allow force save after conflict', async () => {
    const conflictResponse = new Response(
      JSON.stringify({
        message: 'Concurrent modification detected',
        context: {
          conflictDetails: {
            locale: 'en',
            lastModifiedAt: '2026-02-01T10:30:00Z',
            lastModifiedBy: {
              id: 'user_456',
              name: 'Other User',
            },
          },
        },
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );

    mockUpdateDraftTranslations.mockRejectedValueOnce(new ResponseError(conflictResponse));
    mockUpdateDraftTranslations.mockResolvedValueOnce({
      updated: [
        {
          locale: 'en',
          value: 'Forced Update',
          updatedAt: new Date('2026-02-01T11:00:00Z'),
          updatedBy: {
            id: 'user_123',
            name: 'Test User',
          },
        },
      ],
    });

    const { user } = renderComponent();

    const textarea = screen.getByRole('textbox', { name: /edit draft translation/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.clear(textarea);
    await user.type(textarea, 'Forced Update');
    await user.click(saveButton);

    // Wait for conflict dialog
    await screen.findByText(/concurrent modification/i);

    // Click force save button
    const forceSaveButton = screen.getByRole('button', { name: /force save/i });
    await user.click(forceSaveButton);

    expect(mockUpdateDraftTranslations).toHaveBeenCalledTimes(2);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });
});
