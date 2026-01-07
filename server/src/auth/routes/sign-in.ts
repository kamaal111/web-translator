import { describeRoute, resolver, validator } from 'hono-openapi';
import z from 'zod';

import { AuthResponseSchema } from '../schemas/responses';
import type { HonoContext } from '../../context';
import { getHeadersWithJwtAfterAuth, handleAuthRequest } from '../utils/request';
import { ServerInternal } from '../../exceptions';
import { getLogger } from '../../context/logging';
import { TokenHeadersDescription } from '../schemas/headers';
import { ErrorResponseSchema } from '../../schemas/error';
import { OPENAPI_TAG } from '../constants';

type EmailPasswordSignIn = z.infer<typeof EmailPasswordSignInSchema>;
type SignInInput = { out: { json: EmailPasswordSignIn } };

const EmailPasswordSignInSchema = z
  .object({
    email: z.email().meta({
      description: 'User email address',
      example: 'user@example.com',
    }),
    password: z.string().min(6).meta({
      description: 'User password (minimum 6 characters)',
      example: 'securePassword123',
    }),
    callbackURL: z.url().optional().meta({
      description:
        'Optional URL to redirect to after successful sign in. If not provided, the default redirect will be used.',
      example: 'https://app.example.com/dashboard',
    }),
  })
  .describe('Email password sign in payload')
  .meta({
    ref: 'EmailPasswordSignIn',
    title: 'Email Password Sign In Request',
    description: 'Request payload for signing in with email and password credentials',
    example: {
      email: 'user@example.com',
      password: 'securePassword123',
      callbackURL: 'https://app.example.com/dashboard',
    },
  });

const signInRoute = [
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
  validator('json', EmailPasswordSignInSchema),
  async (c: HonoContext<SignInInput>) => {
    const { jsonResponse, sessionToken } = await handleAuthRequest(c, { responseSchema: AuthResponseSchema });
    if (!sessionToken) {
      getLogger(c).error('Sign-in failed: no session token returned from better-auth');
      throw new ServerInternal(c);
    }
    const headers = await getHeadersWithJwtAfterAuth(c, sessionToken);

    return c.json(jsonResponse, { status: 200, headers });
  },
] as const;

export default signInRoute;
