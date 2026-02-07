import { describeRoute, resolver, validator } from 'hono-openapi';
import { ErrorResponseSchema } from '@wt/schemas';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ListProjectsResponseSchema } from '../schemas';
import { dbProjectToResponse } from '../mappers';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';

type ListProjectsInput = { out: { header: PartialAuthenticationHeaders } };

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
    validator('header', PartialAuthenticationHeadersSchema),
    async (c: HonoContext<ListProjectsInput>) => {
      const db = getDatabase(c);
      const projects = await db.projects.list();

      return c.json(projects.map(dbProjectToResponse), 200);
    },
  ] as const;
}

export default listProjectsRoute;
