import { AuthenticationApi } from '@/generated/api-client/src/apis/AuthenticationApi';
import type { Configuration } from '@/generated/api-client/src/runtime';
import type { EmailPasswordSignIn, EmailPasswordSignUp } from '@/generated/api-client/src';

class AuthClient {
  private readonly authApi: AuthenticationApi;

  constructor(config: Configuration) {
    this.authApi = new AuthenticationApi(config);
  }

  getSession = () => {
    return this.authApi.getAppApiV1AuthSession();
  };

  login = (payload: EmailPasswordSignIn) => {
    return this.authApi.postAppApiV1AuthSignInEmail({ emailPasswordSignIn: payload });
  };

  signUp = (payload: EmailPasswordSignUp) => {
    return this.authApi.postAppApiV1AuthSignUpEmail({ emailPasswordSignUp: payload });
  };
}

export default AuthClient;
