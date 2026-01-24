import assert from 'node:assert';

import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { CreateProjectPayloadSchema, ProjectResponseSchema, type CreateProjectPayload } from '../schemas';
import { dbProjectToResponse, requestCreateProjectPayloadToDbPayload } from '../mappers';
import requireLoggedInSession from '../../auth/middleware/require-logged-in-session';
import { getSession } from '../../context/session';
import { ErrorResponseSchema } from '../../schemas/error';

type CreateProjectInput = { out: { json: CreateProjectPayload } };

const createProjectRoute = [
  '/',
  describeRoute({
    description: 'Create project',
    tags: [OPENAPI_TAG],
    responses: {
      201: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(ProjectResponseSchema) },
        },
      },
      400: {
        description: 'Bad request - Invalid payload schema or validation errors',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
      404: {
        description: 'Not authenticated',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
      409: {
        description: 'Conflict - Project with this name already exists for the user',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
    },
  }),
  validator('json', CreateProjectPayloadSchema),
  requireLoggedInSession(),
  async (c: HonoContext<CreateProjectInput>) => {
    const session = getSession(c);
    assert(session != null, 'Middleware should have made sure that session is present');

    const db = getDatabase(c);
    const payload = requestCreateProjectPayloadToDbPayload(c.req.valid('json'));
    const project = await db.projects.createProject(payload);

    return c.json(dbProjectToResponse(project), 201);
  },
] as const;

export default createProjectRoute;
