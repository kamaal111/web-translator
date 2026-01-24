import assert from 'node:assert';

import { describeRoute, resolver } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ListProjectsResponseSchema } from '../schemas';
import { dbProjectToResponse } from '../mappers';
import requireLoggedInSession from '../../auth/middleware/require-logged-in-session';
import { getSession } from '../../context/session';
import { ErrorResponseSchema } from '../../schemas/error';

const listProjectsRoute = [
  '/',
  describeRoute({
    description: 'List all projects for the authenticated user',
    tags: [OPENAPI_TAG],
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(ListProjectsResponseSchema) },
        },
      },
      404: {
        description: 'Not authenticated',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
    },
  }),
  requireLoggedInSession(),
  async (c: HonoContext) => {
    const session = getSession(c);
    assert(session != null, 'Middleware should have made sure that session is present');

    const db = getDatabase(c);
    const projects = await db.projects.list();

    return c.json(projects.map(dbProjectToResponse), 200);
  },
] as const;

export default listProjectsRoute;
