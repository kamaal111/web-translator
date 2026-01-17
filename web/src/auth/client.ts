import { createAuthClient } from 'better-auth/react';

import { AuthenticationApi } from '@/generated/api-client/src/apis/AuthenticationApi';
import { Configuration } from '@/generated/api-client/src/runtime';
import type { EmailPasswordSignIn, EmailPasswordSignUp } from '@/generated/api-client/src';

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

  login(payload: EmailPasswordSignIn) {
    return this.betterAuthClient.signIn.email(payload);
  }

  signUp(payload: EmailPasswordSignUp) {
    return this.betterAuthClient.signUp.email(payload);
  }
}

export default AuthClient;
