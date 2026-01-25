import assert from 'node:assert';

import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ProjectResponseSchema, ReadProjectParamsSchema, type ReadProjectParams } from '../schemas';
import { dbProjectToResponse } from '../mappers';
import { getSession } from '../../context/session';
import { ErrorResponseSchema } from '../../schemas/error';
import { ProjectNotFound } from '../exceptions';

type ReadProjectInput = { out: { param: ReadProjectParams } };

const readProjectRoute = [
  '/:id',
  describeRoute({
    description: 'Get a single project by ID',
    tags: [OPENAPI_TAG],
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(ProjectResponseSchema) },
        },
      },
      400: {
        description: 'Bad request - Invalid project ID format',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
      404: {
        description: 'Project not found or not authenticated',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
    },
  }),
  validator('param', ReadProjectParamsSchema),
  async (c: HonoContext<ReadProjectInput>) => {
    const session = getSession(c);
    assert(session != null, 'Middleware should have made sure that session is present');

    const db = getDatabase(c);
    const { id } = c.req.valid('param');
    const project = await db.projects.read(id);

    if (project == null) {
      throw new ProjectNotFound(c);
    }

    return c.json(dbProjectToResponse(project), 200);
  },
] as const;

export default readProjectRoute;
