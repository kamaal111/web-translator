import AuthClient from '@/auth/client';
import { Configuration } from '@/generated/api-client/src';
import ProjectsClient from '@/projects/client';

class ApiClient {
  readonly auth: AuthClient;
  readonly projects: ProjectsClient;

  constructor(baseUrl: string) {
    const config = new Configuration({ basePath: baseUrl, credentials: 'include' });
    this.auth = new AuthClient(config);
    this.projects = new ProjectsClient(config);
  }
}

const apiClient = new ApiClient(window.location.origin);

export default apiClient;
