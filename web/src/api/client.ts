import AuthClient from '@/auth/client';
import { Configuration } from '@/generated/api-client/src';
import ProjectsClient from '@/projects/client';
import StringsClient from '@/strings/client';

class ApiClient {
  readonly auth: AuthClient;
  readonly projects: ProjectsClient;
  readonly strings: StringsClient;

  constructor(baseUrl: string) {
    const config = new Configuration({ basePath: baseUrl, credentials: 'include' });
    this.auth = new AuthClient(config);
    this.projects = new ProjectsClient(config);
    this.strings = new StringsClient(config);
  }
}

const apiClient = new ApiClient(window.location.origin);

export default apiClient;
