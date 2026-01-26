import z from 'zod';
import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ListStringsResponseSchema } from '../schemas';

import { ErrorResponseSchema } from '../../schemas/error';
import { dbStringToResponse } from '../mappers';
import { ProjectIdShape } from '../../projects/schemas';
import { getValidatedProject } from '../../projects';

type ListStringsParams = z.infer<typeof ListStringsParamsSchema>;

type ListStringsInput = { out: { param: ListStringsParams } };

const ListStringsParamsSchema = z.object({
  projectId: ProjectIdShape,
});

function listStringsRoute() {
  return [
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
        404: {
          description: 'Project not found',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
      },
    }),
    validator('param', ListStringsParamsSchema),
    async (c: HonoContext<ListStringsInput>) => {
      const { projectId } = c.req.valid('param');
      const project = await getValidatedProject(c, projectId);
      const strings = await getDatabase(c).strings.list(project);

      return c.json(strings.map(dbStringToResponse), 200);
    },
  ] as const;
}

export default listStringsRoute;
