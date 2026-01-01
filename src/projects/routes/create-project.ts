import z from 'zod';
import { describeRoute, resolver } from 'hono-openapi';

import type { HonoContext } from '../../context';

type CreateProjectInput = { out: undefined };

const CreateProjectResponseSchema = z.object({});

const createProjectRoute = [
  '/',
  describeRoute({
    description: 'Create project',
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
    const db = c.get('db');
    const project = await db.projects.createProject();
    console.log('project', project);
    return c.json({});
  },
] as const;

export default createProjectRoute;
