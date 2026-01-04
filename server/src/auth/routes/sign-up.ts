import { describeRoute, resolver, validator } from 'hono-openapi';
import z from 'zod';

import { AuthResponseSchema } from '../schemas/responses';
import type { HonoContext } from '../../context';
import { getHeadersWithJwtAfterAuth, handleAuthRequest } from '../utils/request';
import { TokenHeadersDescription } from '../schemas/headers';
import { ErrorResponseSchema } from '../../schemas/error';

type EmailPasswordSignUp = z.infer<typeof EmailPasswordSignUpSchema>;
type SignUpInput = { out: { json: EmailPasswordSignUp } };

const EmailPasswordSignUpSchema = z
  .object({
    email: z.email().meta({
      description: 'User email address',
      example: 'john.doe@example.com',
    }),
    password: z.string().min(8).max(128).meta({
      description: 'User password (minimum 8 characters)',
      example: 'SecurePassword123!',
    }),
    name: z
      .string()
      .trim()
      .min(3)
      .refine(val => val === val.trim(), {
        message: 'Name must not have leading or trailing spaces',
      })
      .refine(val => /^[^\s]+(\s[^\s]+)+$/.test(val), {
        message: 'Name must contain at least 2 words separated by single spaces',
      })
      .refine(val => val.split(/\s+/).every(word => /[a-zA-Z]/.test(word)), {
        message: 'Each word must contain at least one letter',
      })
      .meta({
        description: 'User display name (minimum 2 words, each with at least one letter)',
        example: 'John Doe',
      }),
    callbackURL: z.url().optional().meta({
      description: 'URL to redirect to after sign up',
      example: 'https://example.com/dashboard',
    }),
  })
  .describe('Email password sign up payload')
  .meta({ ref: 'EmailPasswordSignUp' });

const signUpRoute = [
  '/sign-up/email',
  describeRoute({
    description: 'Create a new user account with email and password',
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
  validator('json', EmailPasswordSignUpSchema),
  async (c: HonoContext<SignUpInput>) => {
    const { jsonResponse, sessionToken } = await handleAuthRequest(c, { responseSchema: AuthResponseSchema });
    const headers = await getHeadersWithJwtAfterAuth(c, sessionToken);

    return c.json(jsonResponse, { status: 201, headers });
  },
] as const;

export default signUpRoute;
