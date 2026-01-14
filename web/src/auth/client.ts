import { createAuthClient } from 'better-auth/react';

import { AuthenticationApi } from '@/generated/api-client/src/apis/AuthenticationApi';
import { Configuration } from '@/generated/api-client/src/runtime';

class AuthClient {
  private readonly betterAuthClient: ReturnType<typeof createAuthClient>;
  private readonly authApi: AuthenticationApi;

  constructor(baseUrl: string) {
    this.betterAuthClient = createAuthClient({});
    this.authApi = new AuthenticationApi(new Configuration({ basePath: baseUrl, credentials: 'include' }));
  }

  async getSession() {
    return this.authApi.getAppApiV1AuthSession();
  }

  login(payload: { email: string; password: string }) {
    return this.betterAuthClient.signIn.email(payload);
  }
}

export default AuthClient;
