import assert from 'node:assert';

import { describe, test, expect, vi, beforeEach } from 'vitest';

import { render, screen, userEvent } from '@test-utils';
import client from '@/api/client';

import PublishButton from './publish-button';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      publishSnapshot: vi.fn(),
    },
  },
}));

describe('PublishButton', () => {
  const mockPublishSnapshot = vi.mocked(client.projects.publishSnapshot);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    projectId: 'proj_test',
  };

  const renderComponent = (props = defaultProps) => {
    render(<PublishButton {...props} />);
    return { user: userEvent };
  };

  test('should render publish button', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /publish/i });
    expect(button).toBeDefined();
  });

  test('should open confirmation dialog when clicked', async () => {
    const { user } = renderComponent();

    const button = screen.getByRole('button', { name: /publish/i });
    await user.click(button);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByText(/confirm publish/i)).toBeDefined();
  });

  test('should call publish API when confirmed', async () => {
    mockPublishSnapshot.mockResolvedValue({
      published: [
        {
          locale: 'en',
          version: 1,
          snapshotId: 'snap_001',
          stringCount: 5,
          createdAt: new Date('2026-02-07T15:30:00Z'),
        },
        {
          locale: 'es',
          version: 1,
          snapshotId: 'snap_002',
          stringCount: 5,
          createdAt: new Date('2026-02-07T15:30:00Z'),
        },
      ],
      createdBy: { id: 'user_123', name: 'Test User' },
    });

    const { user } = renderComponent();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockPublishSnapshot).toHaveBeenCalledWith({
      projectId: 'proj_test',
      publishSnapshotBody: {},
    });
  });

  test('should close dialog when cancelled', async () => {
    const { user } = renderComponent();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockPublishSnapshot).not.toHaveBeenCalled();
  });

  test('should show loading state while publishing', async () => {
    let resolvePublish: ((value: unknown) => void) | undefined;
    const publishPromise = new Promise(resolve => {
      resolvePublish = resolve;
    });
    mockPublishSnapshot.mockReturnValue(publishPromise as ReturnType<typeof mockPublishSnapshot>);

    const { user } = renderComponent();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    const publishingText = await screen.findByText(/publishing/i);
    expect(publishingText).toBeDefined();

    assert(resolvePublish, 'Expected resolvePublish to be assigned');
    resolvePublish({
      published: [
        {
          locale: 'en',
          version: 1,
          snapshotId: 'snap_001',
          stringCount: 5,
          createdAt: new Date('2026-02-07T15:30:00Z'),
        },
      ],
      createdBy: { id: 'user_123', name: 'Test User' },
    });
  });

  test('should show error message on publish failure', async () => {
    mockPublishSnapshot.mockRejectedValue(new Error('Publish failed'));

    const { user } = renderComponent();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    const errorMessage = await screen.findByText(/failed to publish/i);
    expect(errorMessage).toBeDefined();
  });

  test('should handle 409 no-changes error', async () => {
    const { ResponseError } = await import('@/generated/api-client/src');
    const errorResponse = new Response(
      JSON.stringify({
        code: 'NO_CHANGES_DETECTED',
        message: 'Draft translations are identical to the latest snapshot',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
    mockPublishSnapshot.mockRejectedValue(new ResponseError(errorResponse, 'Conflict'));

    const { user } = renderComponent();

    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    const noChangesMessage = await screen.findByText(/no changes/i);
    expect(noChangesMessage).toBeDefined();
  });
});
