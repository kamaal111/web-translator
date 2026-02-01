import assert from 'node:assert';

import { describeRoute, resolver, validator } from 'hono-openapi';

import { OPENAPI_TAG } from '../constants';
import requireLoggedInSession from '../middleware/require-logged-in-session';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';
import { SessionResponseSchema } from '../schemas/responses';
import { ErrorResponseSchema } from '../../schemas/error';
import type { HonoContext } from '../../context';
import { getSession } from '../../context/session';

type SessionInput = { out: { header: PartialAuthenticationHeaders } };

function sessionRoute() {
  return [
    '/session',
    describeRoute({
      tags: [OPENAPI_TAG],
      summary: 'Get session',
      description:
        'Get the current user session information. Can authenticate via either Authorization header (JWT bearer token) or session cookie.',
      responses: {
        200: {
          description: 'Session retrieved successfully',
          content: {
            'application/json': {
              schema: resolver(SessionResponseSchema),
            },
          },
        },
        404: {
          description: 'Session not found',
          content: {
            'application/json': {
              schema: resolver(ErrorResponseSchema),
            },
          },
        },
      },
    }),
    validator('header', PartialAuthenticationHeadersSchema),
    requireLoggedInSession(),
    async (c: HonoContext<SessionInput>) => {
      const session = getSession(c);
      assert(session != null, 'Middleware should have made sure that session is present');

      return c.json(session, { status: 200 });
    },
  ] as const;
}

export default sessionRoute;
