import assert from 'node:assert';

import { describeRoute, resolver } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ListStringsResponseSchema } from '../schemas';
import { mapDbStringToModel } from '../mappers';
import { getSession } from '../../context/session';
import { ErrorResponseSchema } from '../../schemas/error';

function dbStringToResponse(str: ReturnType<typeof mapDbStringToModel>) {
  return {
    id: str.id,
    key: str.key,
    context: str.context,
    project_id: str.projectId,
  };
}

const listStringsRoute = [
  '/:projectId',
  describeRoute({
    description: 'List all translation strings for a project',
    tags: [OPENAPI_TAG],
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(ListStringsResponseSchema) },
        },
      },
      401: {
        description: 'Not authenticated',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
    },
  }),
  async (c: HonoContext) => {
    const session = getSession(c);
    assert(session != null, 'Middleware should have made sure that session is present');

    const projectId = c.req.param('projectId');
    assert(projectId, 'projectId param should be present');

    const db = getDatabase(c);
    const strings = await db.strings.list(projectId);

    return c.json(strings.map(dbStringToResponse), 200);
  },
] as const;

export default listStringsRoute;
