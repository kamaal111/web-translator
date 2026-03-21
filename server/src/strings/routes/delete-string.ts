import { describeRoute, resolver, validator } from 'hono-openapi';
import { ErrorResponseSchema } from '@wt/schemas';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { getLogger } from '../../context/logging';
import { getValidatedProject } from '../../projects';
import { StringNotFound } from '../../projects/exceptions';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';
import { toISO8601String } from '../../utils/dates';
import { OPENAPI_TAG } from '../constants';
import {
  DeleteStringParamsSchema,
  DeleteStringResponseSchema,
  type DeleteStringParams,
  type DeleteStringResponse,
} from '../schemas';

type DeleteStringInput = {
  out: {
    param: DeleteStringParams;
    header: PartialAuthenticationHeaders;
  };
};

function deleteStringRoute() {
  return [
    '/:projectId/strings/:stringKey',
    describeRoute({
      description: 'Delete a string and all of its draft translations for a project',
      tags: [OPENAPI_TAG],
      responses: {
        200: {
          description: 'String deleted successfully',
          content: {
            'application/json': { schema: resolver(DeleteStringResponseSchema) },
          },
        },
        400: {
          description: 'Bad request - Invalid path parameters',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
        401: {
          description: 'Not authenticated',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
        404: {
          description: 'Project or string not found',
          content: {
            'application/json': { schema: resolver(ErrorResponseSchema) },
          },
        },
      },
    }),
    validator('header', PartialAuthenticationHeadersSchema),
    validator('param', DeleteStringParamsSchema),
    async (c: HonoContext<DeleteStringInput>) => {
      const { projectId, stringKey } = c.req.valid('param');
      const project = await getValidatedProject(c, projectId);
      const deleted = await getDatabase(c).strings.deleteByKey(project, stringKey);

      if (!deleted) {
        getLogger(c).error('String not found while deleting string', {
          project_id: project.id,
          string_key: stringKey,
          operation: 'delete_string',
        });
        throw new StringNotFound(c);
      }

      const response: DeleteStringResponse = {
        deleted: {
          key: stringKey,
          deletedAt: toISO8601String(new Date()),
        },
      };

      getLogger(c).info('String deleted', {
        project_id: project.id,
        string_key: stringKey,
        operation: 'delete_string',
      });

      return c.json(response, 200);
    },
  ] as const;
}

export default deleteStringRoute;
