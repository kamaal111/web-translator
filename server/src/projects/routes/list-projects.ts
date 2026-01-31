import { describeRoute, resolver } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ListProjectsResponseSchema } from '../schemas';
import { dbProjectToResponse } from '../mappers';
import { ErrorResponseSchema } from '../../schemas/error';

function listProjectsRoute() {
  return [
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
    async (c: HonoContext) => {
      const db = getDatabase(c);
      const projects = await db.projects.list();

      return c.json(projects.map(dbProjectToResponse), 200);
    },
  ] as const;
}

export default listProjectsRoute;
