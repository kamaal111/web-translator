import { describe, test, expect, vi, beforeEach } from 'vitest';

import { render, screen, userEvent } from '@test-utils';
import CreateStringDialog from './create-string-dialog';
import client from '@/api/client';

vi.mock('@/api/client', () => ({
  default: {
    strings: {
      upsertTranslations: vi.fn(),
    },
  },
}));

describe('CreateStringDialog', () => {
  const mockUpsertTranslations = vi.mocked(client.strings.upsertTranslations);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    projectId: 'proj_test',
    defaultLocale: 'en',
    open: true,
    onOpenChange: vi.fn(),
  };

  const renderComponent = (props = defaultProps) => {
    render(<CreateStringDialog {...props} />);

    return { user: userEvent };
  };

  test('should render dialog title', () => {
    renderComponent();

    expect(screen.getByText(/create new string/i)).toBeDefined();
  });

  test('should render dialog description', () => {
    renderComponent();

    expect(screen.getByText(/add a new translation string/i)).toBeDefined();
  });

  test('should render key input field', () => {
    renderComponent();

    const keyInput = screen.getByPlaceholderText(/HOME\.TITLE/i);
    expect(keyInput).toBeDefined();
  });

  test('should render context input field', () => {
    renderComponent();

    const contextInput = screen.getByPlaceholderText(/describe where this string is used/i);
    expect(contextInput).toBeDefined();
  });

  test('should render translation input field with locale label', () => {
    renderComponent();

    const translationInput = screen.getByPlaceholderText(/enter translation value/i);
    expect(translationInput).toBeDefined();
  });

  test('should render cancel button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
  });

  test('should not render when dialog is closed', () => {
    renderComponent({ ...defaultProps, open: false });

    expect(screen.queryByText(/create new string/i)).toBeNull();
  });

  test('should submit form with correct data', async () => {
    mockUpsertTranslations.mockResolvedValue({ updatedCount: 1 });

    const { user } = renderComponent();

    const keyInput = screen.getByPlaceholderText(/HOME\.TITLE/i);
    await user.type(keyInput, 'SETTINGS.TITLE');

    const translationInput = screen.getByPlaceholderText(/enter translation value/i);
    await user.type(translationInput, 'Settings');

    const submitButton = screen.getByRole('button', { name: /^submit$/i });
    await user.click(submitButton);

    expect(mockUpsertTranslations).toHaveBeenCalledWith({
      projectId: 'proj_test',
      upsertTranslationsPayload: {
        translations: [
          {
            key: 'SETTINGS.TITLE',
            context: undefined,
            translations: { en: 'Settings' },
          },
        ],
      },
    });
  });

  test('should call onOpenChange when cancel is clicked', async () => {
    const { user } = renderComponent();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
