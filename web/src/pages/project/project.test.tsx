import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router';

import { render, screen, userEvent } from '@test-utils';
import client from '@/api/client';
import { ResponseError, FetchError } from '@/generated/api-client/src/runtime';
import type { ProjectResponse } from '@/generated/api-client/src';
import Project from './project';

vi.mock('@/api/client', () => ({
  default: {
    projects: {
      read: vi.fn(),
    },
  },
}));

const mockProject: ProjectResponse = {
  id: 'proj_123',
  name: 'Test Project',
  defaultLocale: 'en-US',
  enabledLocales: ['en-US', 'fr-FR', 'es-ES'],
  publicReadKey: 'pk_test123',
};

describe('Project', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProject = (projectId = 'proj_123') => {
    return render(
      <Routes>
        <Route path="/projects/:id" element={<Project />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>,
      { initialRouterEntries: [`/projects/${projectId}`] },
    );
  };

  it('should show loading state while fetching project', () => {
    vi.mocked(client.projects.read).mockImplementation(() => new Promise(() => {}));

    renderProject();

    const loadingText = screen.getByText(/Loading project.../i);
    expect(loadingText).toBeDefined();
  });

  it('should show not found message with home button on 404 error', async () => {
    const response = new Response(null, { status: 404 });
    const error = new ResponseError(response, 'Not Found');
    vi.mocked(client.projects.read).mockRejectedValue(error);

    renderProject();

    const notFoundMessage = await screen.findByText(/Project does not exist/i);
    expect(notFoundMessage).toBeDefined();

    const homeButton = screen.getByRole('button', { name: /Go to Home/i });
    expect(homeButton).toBeDefined();
  });

  it('should show not found message with home button on 400 error', async () => {
    const response = new Response(null, { status: 400 });
    const error = new ResponseError(response, 'Bad Request');
    vi.mocked(client.projects.read).mockRejectedValue(error);

    renderProject();

    const notFoundMessage = await screen.findByText(/Project does not exist/i);
    expect(notFoundMessage).toBeDefined();

    const homeButton = screen.getByRole('button', { name: /Go to Home/i });
    expect(homeButton).toBeDefined();
  });

  it('should navigate to home page when Go to Home button is clicked', async () => {
    const user = userEvent;
    const response = new Response(null, { status: 404 });
    const error = new ResponseError(response, 'Not Found');
    vi.mocked(client.projects.read).mockRejectedValue(error);

    renderProject();

    const homeButton = await screen.findByRole('button', { name: /Go to Home/i });
    await user.click(homeButton);

    const homePage = await screen.findByText('Home Page');
    expect(homePage).toBeDefined();
  });

  it('should show generic error message without home button on 5xx error', async () => {
    const response = new Response(null, { status: 500 });
    const error = new ResponseError(response, 'Internal Server Error');
    vi.mocked(client.projects.read).mockRejectedValue(error);

    renderProject();

    const errorMessage = await screen.findByText(/Failed to load project/i);
    expect(errorMessage).toBeDefined();

    const homeButton = screen.queryByRole('button', { name: /Go to Home/i });
    expect(homeButton).toBeNull();
  });

  it('should show generic error message without home button on network error', async () => {
    const networkError = new Error('Network connection failed');
    const error = new FetchError(networkError, 'Failed to fetch');
    vi.mocked(client.projects.read).mockRejectedValue(error);

    renderProject();

    const errorMessage = await screen.findByText(/Failed to load project/i);
    expect(errorMessage).toBeDefined();

    const homeButton = screen.queryByRole('button', { name: /Go to Home/i });
    expect(homeButton).toBeNull();
  });

  it('should display project name', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);

    renderProject();

    const projectName = await screen.findByText('Test Project');
    expect(projectName).toBeDefined();
  });

  it('should display default locale', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);

    renderProject();

    const defaultLocale = await screen.findByText(/Default Locale: en-US/i);
    expect(defaultLocale).toBeDefined();
  });

  it('should display all enabled locales as badges', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);

    renderProject();

    const enUSBadge = await screen.findByText('en-US');
    const frFRBadge = await screen.findByText('fr-FR');
    const esESBadge = await screen.findByText('es-ES');

    expect(enUSBadge).toBeDefined();
    expect(frFRBadge).toBeDefined();
    expect(esESBadge).toBeDefined();
  });

  it('should display public read key', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);

    renderProject();

    const publicReadKey = await screen.findByText('pk_test123');
    expect(publicReadKey).toBeDefined();
  });

  it('should call API with correct project ID from URL', async () => {
    vi.mocked(client.projects.read).mockResolvedValue(mockProject);

    renderProject('proj_456');

    await screen.findByText('Test Project');

    expect(client.projects.read).toHaveBeenCalledWith('proj_456');
    expect(client.projects.read).toHaveBeenCalledTimes(1);
  });
});
