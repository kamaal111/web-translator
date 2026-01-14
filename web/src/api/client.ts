import AuthClient from '@/auth/client';

class ApiClient {
  readonly auth: AuthClient;

  constructor(baseUrl: string) {
    this.auth = new AuthClient(baseUrl);
  }
}

const apiClient = new ApiClient(window.location.origin);

export default apiClient;
