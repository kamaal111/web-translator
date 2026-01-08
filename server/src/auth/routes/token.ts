import z from 'zod';
import { describeRoute, resolver } from 'hono-openapi';

import { OPENAPI_TAG, TOKEN_ROUTE_NAME } from '../constants';
import type { HonoContext } from '../../context';
import { ErrorResponseSchema } from '../../schemas/error';
import { TokenHeadersDescription } from '../schemas/headers';
import { makeNewRequest } from '../../utils/request';
import { SessionNotFound } from '../exceptions';
import { parseTokenResponseAndCreateHeaders } from '../utils/request';
import { getAuth } from '../../context/auth';

const TokenResponseSchema = z
  .object({
    token: z.string().meta({ description: 'JWT token', example: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...' }),
  })
  .describe('Token response')
  .meta({ ref: 'TokenResponse' });

const tokenRoute = [
  TOKEN_ROUTE_NAME,
  describeRoute({
    tags: [OPENAPI_TAG],
    summary: 'Get JWT token',
    description: 'Get a new JWT token for the authenticated session. Use bearer token authentication.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Token retrieved successfully',
        content: {
          'application/json': { schema: resolver(TokenResponseSchema) },
        },
        headers: TokenHeadersDescription,
      },
      401: {
        description: 'Not authenticated or session expired',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
    },
  }),
  async (c: HonoContext) => {
    const request = await makeNewRequest(c);
    const response = await getAuth(c).handler(request);
    if (!response.ok) {
      throw new SessionNotFound(c);
    }

    const authHeader = c.req.header('authorization');
    const sessionToken = authHeader?.replace(/^Bearer\s+/i, '') ?? null;
    const { token, headers } = await parseTokenResponseAndCreateHeaders(response, sessionToken);

    return c.json({ token }, { status: 200, headers });
  },
] as const;

export default tokenRoute;
