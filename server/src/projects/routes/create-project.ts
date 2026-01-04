import z from 'zod';
import { describeRoute, resolver } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';

type CreateProjectInput = { out: undefined };

const CreateProjectResponseSchema = z.object({});

const createProjectRoute = [
  '/',
  describeRoute({
    description: 'Create project',
    tags: [OPENAPI_TAG],
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(CreateProjectResponseSchema) },
        },
      },
    },
  }),
  async (c: HonoContext<CreateProjectInput>) => {
    const db = getDatabase(c);
    const project = await db.projects.createProject();
    console.log('project', project);
    return c.json({});
  },
] as const;

export default createProjectRoute;
