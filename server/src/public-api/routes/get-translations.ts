import { describeRoute, resolver, validator } from 'hono-openapi';
import { z } from 'zod';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { ErrorResponseSchema } from '../../schemas/error';
import { NotFound, Unauthorized } from '../../exceptions';
import { GetTranslationsResponseSchema } from '../../strings/schemas';

const OPENAPI_TAG = 'Translations';

const GetTranslationsParamsSchema = z.object({
  projectId: z.uuid().describe('ID of the project').meta({
    example: 'proj_1234567890abcdef',
  }),
  locale: z.string().min(1).describe('Locale code (e.g., en, es, fr)').meta({
    example: 'en',
  }),
});

const GetTranslationsQuerySchema = z.object({
  v: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Version number to fetch (optional, omit for latest published version)')
    .meta({ example: 1 }),
});

const GetTranslationsHeadersSchema = z.object({
  'x-public-key': z.string().min(1).describe('Public read key for the project').meta({
    example: 'pk_abc123',
  }),
});

type GetTranslationsInput = {
  out: {
    param: z.infer<typeof GetTranslationsParamsSchema>;
    query: z.infer<typeof GetTranslationsQuerySchema>;
    header: z.infer<typeof GetTranslationsHeadersSchema>;
  };
};

const getTranslationsRoute = [
  '/projects/:projectId/translations/:locale',
  describeRoute({
    description:
      'Get translations for a specific locale in a project. Returns the latest published snapshot by default, or a specific version with ?v=N. Requires public key in headers.',
    tags: [OPENAPI_TAG],
    responses: {
      200: {
        description: 'Successful response - returns key-value map of translations',
        content: {
          'application/json': { schema: resolver(GetTranslationsResponseSchema) },
        },
      },
      400: {
        description: 'Bad request - Invalid parameters or headers',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
      401: {
        description: 'Invalid or missing public key',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
      404: {
        description: 'Project not found, no published versions, or specific version not found',
        content: {
          'application/json': { schema: resolver(ErrorResponseSchema) },
        },
      },
    },
  }),
  validator('param', GetTranslationsParamsSchema),
  validator('query', GetTranslationsQuerySchema),
  validator('header', GetTranslationsHeadersSchema),
  async (c: HonoContext<GetTranslationsInput>) => {
    const { projectId, locale } = c.req.valid('param');
    const { v: version } = c.req.valid('query');
    const { 'x-public-key': publicKey } = c.req.valid('header');

    const db = getDatabase(c);

    // Find project by ID (primary key - efficient)
    const project = await db.projects.readById(projectId);

    if (!project) {
      throw new NotFound(c, {
        message: 'Project not found',
        name: 'ProjectNotFound',
      });
    }

    // Verify public key matches
    if (project.publicKey !== publicKey) {
      throw new Unauthorized(c, {
        message: 'Invalid public key',
      });
    }

    // Fetch snapshot - either specific version or latest
    const snapshot =
      version !== undefined
        ? await db.snapshots.getSnapshot(project.id, locale, version)
        : await db.snapshots.getLatestSnapshot(project.id, locale);

    if (!snapshot) {
      const message =
        version !== undefined
          ? `Version ${version} not found for locale ${locale}`
          : `No published versions for locale ${locale}`;
      throw new NotFound(c, {
        message,
        name: 'VersionNotFound',
      });
    }

    return c.json(snapshot.data, 200);
  },
] as const;

export default getTranslationsRoute;
