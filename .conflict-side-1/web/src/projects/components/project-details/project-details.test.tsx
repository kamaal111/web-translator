import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@test-utils';
import toast from 'react-hot-toast';

import ProjectDetails from './project-details';
import type { ProjectResponse } from '@/generated/api-client/src';

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
  defaultLocale: 'en-US',
  enabledLocales: ['en-US', 'fr-FR', 'es-ES'],
  publicReadKey: 'test-public-read-key-123',
};

describe('ProjectDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProjectDetails = (project: ProjectResponse = mockProject) => {
    render(<ProjectDetails project={project} />);
    return { user: userEvent };
  };

  test('should render project name', () => {
    renderProjectDetails();

    const heading = screen.getByRole('heading', { name: 'Test Project', level: 1 });
    expect(heading).toBeDefined();
  });

  test('should render default locale', () => {
    renderProjectDetails();

    const defaultLocaleText = screen.getByText(/default locale: en-us/i);
    expect(defaultLocaleText).toBeDefined();
  });

  test('should render all enabled locales', () => {
    renderProjectDetails();

    expect(screen.getByText('en-US')).toBeDefined();
    expect(screen.getByText('fr-FR')).toBeDefined();
    expect(screen.getByText('es-ES')).toBeDefined();
  });

  test('should redact public read key by default', () => {
    renderProjectDetails();

    const keyText = screen.getByText('•'.repeat(mockProject.publicReadKey.length));
    expect(keyText).toBeDefined();

    const actualKey = screen.queryByText(mockProject.publicReadKey);
    expect(actualKey).toBeNull();
  });

  test('should show key when show button is clicked', async () => {
    const { user } = renderProjectDetails();

    const showButton = screen.getByRole('button', { name: /show key/i });
    expect(showButton).toBeDefined();

    await user.click(showButton);

    const keyText = screen.getByText(mockProject.publicReadKey);
    expect(keyText).toBeDefined();
  });

  test('should hide key when hide button is clicked after showing', async () => {
    const { user } = renderProjectDetails();

    const showButton = screen.getByRole('button', { name: /show key/i });
    await user.click(showButton);

    expect(screen.getByText(mockProject.publicReadKey)).toBeDefined();

    const hideButton = screen.getByRole('button', { name: /hide key/i });
    await user.click(hideButton);

    const redactedKey = screen.getByText('•'.repeat(mockProject.publicReadKey.length));
    expect(redactedKey).toBeDefined();
    expect(screen.queryByText(mockProject.publicReadKey)).toBeNull();
  });

  test('should toggle key visibility multiple times', async () => {
    const { user } = renderProjectDetails();

    const showButton = screen.getByRole('button', { name: /show key/i });

    await user.click(showButton);
    expect(screen.getByText(mockProject.publicReadKey)).toBeDefined();

    const hideButton = screen.getByRole('button', { name: /hide key/i });
    await user.click(hideButton);
    expect(screen.queryByText(mockProject.publicReadKey)).toBeNull();

    const showButtonAgain = screen.getByRole('button', { name: /show key/i });
    await user.click(showButtonAgain);
    expect(screen.getByText(mockProject.publicReadKey)).toBeDefined();
  });

  test('should copy key to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });

    const { user } = renderProjectDetails();

    const copyButton = screen.getByRole('button', { name: /copy key/i });
    expect(copyButton).toBeDefined();

    await user.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith(mockProject.publicReadKey);
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Key copied to clipboard');
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  test('should copy key even when key is hidden', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });

    const { user } = renderProjectDetails();

    const redactedKey = screen.getByText('•'.repeat(mockProject.publicReadKey.length));
    expect(redactedKey).toBeDefined();

    const copyButton = screen.getByRole('button', { name: /copy key/i });
    await user.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith(mockProject.publicReadKey);
    expect(toast.success).toHaveBeenCalledWith('Key copied to clipboard');
  });

  test('should handle different key lengths for redaction', () => {
    const shortKeyProject = { ...mockProject, publicReadKey: 'short' };
    renderProjectDetails(shortKeyProject);

    const redactedShortKey = screen.getByText('•'.repeat(5));
    expect(redactedShortKey).toBeDefined();
  });

  test('should maintain aria-labels for accessibility', () => {
    renderProjectDetails();

    const showButton = screen.getByRole('button', { name: /show key/i });
    expect(showButton.getAttribute('aria-label')).toMatch(/show key/i);

    const copyButton = screen.getByRole('button', { name: /copy key/i });
    expect(copyButton.getAttribute('aria-label')).toMatch(/copy key/i);
  });

  test('should update aria-label when visibility toggles', async () => {
    const { user } = renderProjectDetails();

    const toggleButton = screen.getByRole('button', { name: /show key/i });
    expect(toggleButton.getAttribute('aria-label')).toMatch(/show key/i);

    await user.click(toggleButton);

    const hideButton = screen.getByRole('button', { name: /hide key/i });
    expect(hideButton.getAttribute('aria-label')).toMatch(/hide key/i);
  });
});
