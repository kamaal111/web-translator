import { describeRoute, resolver, validator } from 'hono-openapi';
import { EmailPasswordSignUpPayloadSchema, type EmailPasswordSignUpPayload } from '@wt/schemas';

import { AuthResponseSchema } from '../schemas/responses';
import type { HonoContext } from '../../context';
import { getHeadersWithJwtAfterAuth, handleAuthRequest } from '../utils/request';
import { ServerInternal } from '../../exceptions';
import { getLogger } from '../../context/logging';
import { ErrorResponseSchema } from '../../schemas/error';
import { OPENAPI_TAG } from '../constants';
import { TokenHeadersDescription } from '../schemas/headers';

type SignUpInput = { out: { json: EmailPasswordSignUpPayload } };

function signUpRoute() {
  return [
    '/sign-up/email',
    describeRoute({
      summary: 'Sign up with email and password',
      description: 'Create a new user account with email and password',
      tags: [OPENAPI_TAG],
      responses: {
        201: {
          description: 'Account created successfully',
          content: { 'application/json': { schema: resolver(AuthResponseSchema) } },
          headers: TokenHeadersDescription,
        },
        400: {
          description: 'Invalid request or email already exists',
          content: { 'application/json': { schema: resolver(ErrorResponseSchema) } },
        },
        409: {
          description: 'Email already registered',
          content: { 'application/json': { schema: resolver(ErrorResponseSchema) } },
        },
        401: {
          description: 'Authentication failed or invalid credentials',
          content: { 'application/json': { schema: resolver(ErrorResponseSchema) } },
        },
      },
    }),
    validator('json', EmailPasswordSignUpPayloadSchema),
    async (c: HonoContext<SignUpInput>) => {
      const {
        jsonResponse,
        sessionToken,
        headers: authHeaders,
      } = await handleAuthRequest(c, { responseSchema: AuthResponseSchema });
      if (!sessionToken) {
        getLogger(c).error('Sign-up failed: no session token returned from better-auth');
        throw new ServerInternal(c);
      }
      const headers = await getHeadersWithJwtAfterAuth(c, authHeaders, sessionToken);

      return c.json(jsonResponse, { status: 201, headers });
    },
  ] as const;
}

export default signUpRoute;
