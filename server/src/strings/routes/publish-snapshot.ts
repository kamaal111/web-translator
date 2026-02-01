import { describeRoute, resolver, validator } from 'hono-openapi';
import z from 'zod';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import { ErrorResponseSchema } from '../../schemas/error';
import { getValidatedProject } from '../../projects';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';

type PublishSnapshotInput = {
  out: { param: z.infer<typeof PublishSnapshotParamsSchema>; header: PartialAuthenticationHeaders };
};

export type PublishSnapshotResponse = z.infer<typeof PublishSnapshotResponseSchema>;

const PublishSnapshotParamsSchema = z.object({
  projectId: z.uuid().meta({
    description: 'ID of the project',
    example: 'proj_1234567890abcdef',
  }),
  locale: z.string().min(1).meta({
    description: 'Locale code to publish (e.g., en, es, fr)',
    example: 'en',
  }),
});

export const PublishSnapshotResponseSchema = z
  .object({
    version: z.number().int().positive().meta({
      description: 'The version number of the newly created snapshot',
      example: 1,
    }),
    translation_count: z.number().int().nonnegative().meta({
      description: 'Number of translations in this snapshot',
      example: 42,
    }),
  })
  .describe('Publish snapshot response')
  .meta({
    ref: 'PublishSnapshotResponse',
    title: 'Publish Snapshot Response',
    description: 'Response after creating a new translation snapshot',
  });

function publishSnapshotRoute() {
  return [
    '/:projectId/translations/:locale/publish',
    describeRoute({
      description:
        'Publish a new snapshot version of the current translations for a locale. Creates an immutable copy that can be retrieved using the ?v=N query parameter.',
      tags: [OPENAPI_TAG],
      responses: {
        201: {
          description: 'Snapshot created successfully',
          content: {
            'application/json': { schema: resolver(PublishSnapshotResponseSchema) },
          },
        },
        400: {
          description: 'Bad request - Invalid parameters',
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
      },
    }),
    validator('header', PartialAuthenticationHeadersSchema),
    validator('param', PublishSnapshotParamsSchema),
    async (c: HonoContext<PublishSnapshotInput>) => {
      const db = getDatabase(c);
      const { projectId, locale } = c.req.valid('param');
      const project = await getValidatedProject(c, projectId);
      const snapshot = await db.snapshots.createSnapshot(project, locale);

      return c.json({ version: snapshot.version, translation_count: Object.keys(snapshot.data).length }, 201);
    },
  ] as const;
}

export default publishSnapshotRoute;
