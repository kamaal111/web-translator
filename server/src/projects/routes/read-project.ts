import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { OPENAPI_TAG } from '../constants';
import { ProjectResponseSchema, ReadProjectParamsSchema, type ReadProjectParams } from '../schemas';
import { dbProjectToResponse } from '../mappers';
import { ErrorResponseSchema } from '../../schemas/error';
import { getValidatedProject } from '../utils';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';

type ReadProjectInput = { out: { param: ReadProjectParams; header: PartialAuthenticationHeaders } };

function readProjectRoute() {
  return [
    '/:projectId',
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
    validator('header', PartialAuthenticationHeadersSchema),
    validator('param', ReadProjectParamsSchema),
    async (c: HonoContext<ReadProjectInput>) => {
      const { projectId } = c.req.valid('param');
      const project = await getValidatedProject(c, projectId);

      return c.json(dbProjectToResponse(project), 200);
    },
  ] as const;
}

export default readProjectRoute;
