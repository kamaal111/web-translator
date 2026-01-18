import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import {
  CreateProjectPayloadSchema,
  CreateProjectResponseSchema,
  type CreateProjectPayload,
  type CreateProjectResponse,
} from '../schemas';
import type { IProject } from '../models/project';

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
          'application/json': { schema: resolver(CreateProjectResponseSchema) },
        },
      },
    },
  }),
  validator('json', CreateProjectPayloadSchema),
  async (c: HonoContext<CreateProjectInput>) => {
    const db = getDatabase(c);
    const payload = c.req.valid('json');
    const projectPayload: Omit<IProject, 'id'> = {
      name: payload.name,
      defaultLocale: payload.default_locale,
      enabledLocales: payload.enabled_locales,
      publicKey: payload.public_read_key,
    };
    const project = await db.projects.createProject(projectPayload);
    const response: CreateProjectResponse = {
      id: project.id,
      name: project.name,
      default_locale: project.defaultLocale,
      enabled_locales: project.enabledLocales,
      public_read_key: project.publicKey,
    };

    return c.json(response, 201);
  },
] as const;

export default createProjectRoute;
