import { describe, it, expect, vi, beforeEach } from 'vitest';

import { render, screen } from '@test-utils';
import Home from './home';
import client from '@/api/client';
import type { ProjectResponse } from '@/generated/api-client/src';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      list: vi.fn(),
    },
  },
}));

const mockProjects: ProjectResponse[] = [
  {
    id: 'proj_1',
    name: 'Test Project 1',
    defaultLocale: 'en-US',
    enabledLocales: ['en-US', 'fr-FR', 'es-ES'],
    publicReadKey: 'pk_test1',
  },
  {
    id: 'proj_2',
    name: 'Test Project 2',
    defaultLocale: 'de-DE',
    enabledLocales: ['de-DE'],
    publicReadKey: 'pk_test2',
  },
];

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while fetching projects', () => {
    vi.mocked(client.projects.list).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<Home />);

    const title = screen.getByText(/Your projects/i);
    expect(title).toBeDefined();
    const spinner = screen.getByLabelText('Loading projects');
    expect(spinner, 'Verify spinner is present using aria-label').toBeDefined();
  });

  it('should display message when no projects exist', async () => {
    vi.mocked(client.projects.list).mockResolvedValue([]);

    render(<Home />);

    const noProjectsMessage = await screen.findByText(/You don't have any projects yet/i);
    expect(noProjectsMessage).toBeDefined();
  });

  it('should display error message when fetching projects fails', async () => {
    const error = new Error('Network error');
    vi.mocked(client.projects.list).mockRejectedValue(error);

    render(<Home />);

    const errorMessage = await screen.findByText(/Could not fetch projects/i);
    expect(errorMessage).toBeDefined();
  });

  it('should display error message on server error (5xx)', async () => {
    const serverError = { status: 500, message: 'Internal Server Error' };
    vi.mocked(client.projects.list).mockRejectedValue(serverError);

    render(<Home />);

    const errorMessage = await screen.findByText(/Could not fetch projects/i);
    expect(errorMessage).toBeDefined();
  });

  it('should display error message on timeout', async () => {
    const abortError = new Error('Request timeout - could not fetch projects');
    vi.mocked(client.projects.list).mockRejectedValue(abortError);

    render(<Home />);

    const errorMessage = await screen.findByText(/Could not fetch projects/i, {}, { timeout: 3000 });
    expect(errorMessage).toBeDefined();
  });

  it('should display list of projects', async () => {
    vi.mocked(client.projects.list).mockResolvedValue(mockProjects);

    render(<Home />);

    const project1 = await screen.findByText('Test Project 1');
    const project2 = await screen.findByText('Test Project 2');

    expect(project1).toBeDefined();
    expect(project2).toBeDefined();
  });

  it('should display project details correctly', async () => {
    vi.mocked(client.projects.list).mockResolvedValue([mockProjects[0]]);

    render(<Home />);

    const projectName = await screen.findByText('Test Project 1');
    expect(projectName).toBeDefined();

    const defaultLocale = await screen.findByText(/Default: en-US/i);
    expect(defaultLocale).toBeDefined();

    const localesCount = await screen.findByText(/3 locales/i);
    expect(localesCount).toBeDefined();
  });

  it('should display singular locale count', async () => {
    vi.mocked(client.projects.list).mockResolvedValue([mockProjects[1]]);

    render(<Home />);

    const localesCount = await screen.findByText(/1 locale/i);
    expect(localesCount).toBeDefined();
  });
});
