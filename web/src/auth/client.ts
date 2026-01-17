import { createAuthClient } from 'better-auth/react';

import { AuthenticationApi } from '@/generated/api-client/src/apis/AuthenticationApi';
import { Configuration } from '@/generated/api-client/src/runtime';
import type { LoginPayload, SignUpPayload } from './schemas';

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

  login(payload: LoginPayload) {
    return this.betterAuthClient.signIn.email(payload);
  }

  signUp(payload: SignUpPayload) {
    return this.betterAuthClient.signUp.email(payload);
  }
}

export default AuthClient;
