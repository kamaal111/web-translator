import { describeRoute, resolver, validator } from 'hono-openapi';
import { EmailPasswordSignInPayloadSchema, type EmailPasswordSignInPayload } from '@wt/schemas';

import { AuthResponseSchema } from '../schemas/responses';
import type { HonoContext } from '../../context';
import { getHeadersWithJwtAfterAuth, handleAuthRequest } from '../utils/request';
import { ServerInternal } from '../../exceptions';
import { getLogger } from '../../context/logging';
import { TokenHeadersDescription } from '../schemas/headers';
import { ErrorResponseSchema } from '../../schemas/error';
import { OPENAPI_TAG } from '../constants';

type SignInInput = { out: { json: EmailPasswordSignInPayload } };

function signInRoute() {
  return [
    '/sign-in/email',
    describeRoute({
      summary: 'Sign in with email and password',
      description: 'Authenticate a user with email and password credentials',
      tags: [OPENAPI_TAG],
      responses: {
        200: {
          description: 'Sign in successful',
          content: { 'application/json': { schema: resolver(AuthResponseSchema) } },
          headers: TokenHeadersDescription,
        },
        400: {
          description: 'Invalid credentials or request',
          content: { 'application/json': { schema: resolver(ErrorResponseSchema) } },
        },
        401: {
          description: 'Authentication failed or invalid credentials',
          content: { 'application/json': { schema: resolver(ErrorResponseSchema) } },
        },
      },
    }),
    validator('json', EmailPasswordSignInPayloadSchema),
    async (c: HonoContext<SignInInput>) => {
      const {
        jsonResponse,
        sessionToken,
        headers: authHeaders,
      } = await handleAuthRequest(c, { responseSchema: AuthResponseSchema });
      if (!sessionToken) {
        getLogger(c).error('Sign-in failed: no session token returned from better-auth');
        throw new ServerInternal(c);
      }
      const headers = await getHeadersWithJwtAfterAuth(c, authHeaders, sessionToken);

      return c.json(jsonResponse, { status: 200, headers });
    },
  ] as const;
}

export default signInRoute;
