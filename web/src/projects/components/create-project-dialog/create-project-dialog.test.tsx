import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '@test-utils';

import CreateProjectDialog from './create-project-dialog';
import client from '@/api/client';
import type { ProjectResponse } from '@/generated/api-client/src';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      create: vi.fn(),
    },
  },
}));

const mockProjectResponse: ProjectResponse = {
  id: 'proj_test',
  name: 'Test Project',
  defaultLocale: 'en-US',
  enabledLocales: ['en-US'],
  publicReadKey: 'test-key',
};

describe('CreateProjectDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.projects.create).mockResolvedValue(mockProjectResponse);
  });

  const renderDialog = (open = true) => {
    const onOpenChange = vi.fn();

    render(<CreateProjectDialog open={open} onOpenChange={onOpenChange} />);

    return { user: userEvent, onOpenChange };
  };

  test('should render the generate button for public read key', () => {
    renderDialog();

    const generateButton = screen.getByRole('button', { name: /generate random public read key/i });
    expect(generateButton).toBeDefined();
  });

  test('should generate a random key when generate button is clicked', async () => {
    const { user } = renderDialog();

    const publicReadKeyInput = screen.getByPlaceholderText('public-key-123') as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generate random public read key/i });

    expect(publicReadKeyInput.value).toBe('');

    await user.click(generateButton);

    const generatedValue = publicReadKeyInput.value;
    expect(generatedValue).not.toBe('');
    expect(generatedValue).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  test('should allow user to edit the public read key after generation', async () => {
    const { user } = renderDialog();

    const publicReadKeyInput = screen.getByPlaceholderText('public-key-123') as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generate random public read key/i });

    await user.click(generateButton);

    expect(publicReadKeyInput.value).not.toBe('');

    await user.clear(publicReadKeyInput);
    await user.type(publicReadKeyInput, 'my-custom-key');

    expect(publicReadKeyInput.value).toBe('my-custom-key');
  });

  test('should allow user to provide their own key without clicking generate', async () => {
    const { user } = renderDialog();

    const publicReadKeyInput = screen.getByPlaceholderText('public-key-123') as HTMLInputElement;

    await user.type(publicReadKeyInput, 'user-provided-key');

    expect(publicReadKeyInput.value).toBe('user-provided-key');
  });

  test('should be able to generate multiple times', async () => {
    const { user } = renderDialog();

    const publicReadKeyInput = screen.getByPlaceholderText('public-key-123') as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generate random public read key/i });

    await user.click(generateButton);

    const firstValue = publicReadKeyInput.value;
    expect(firstValue).not.toBe('');

    await user.click(generateButton);

    const secondValue = publicReadKeyInput.value;
    expect(secondValue).not.toBe('');
    expect(secondValue).not.toBe(firstValue);
  });
});
