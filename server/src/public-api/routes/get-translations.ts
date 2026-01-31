import { describeRoute, resolver, validator } from 'hono-openapi';
import { z } from 'zod';
import { LocaleShape } from '@wt/schemas';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { ErrorResponseSchema } from '../../schemas/error';
import { GetTranslationsResponseSchema } from '../../strings/schemas';
import { ProjectIdShape } from '../../projects/schemas';
import { ProjectNotFound, ProjectVersionNotFound } from '../../projects/exceptions';
import { getLogger } from '../../context/logging';
import type Project from '../../projects/models/project';
import type TranslationSnapshot from '../../strings/repositories/snapshots/models';

const OPENAPI_TAG = 'Translations';

const GetTranslationsParamsSchema = z.object({
  projectId: ProjectIdShape,
  locale: LocaleShape.describe('Locale code (e.g., en, es, fr)').meta({ example: 'en' }),
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

function getTranslationsRoute() {
  return [
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
      const project = await db.projects.readById(projectId);
      if (!project) {
        getLogger(c).error('Project not found', { locale });
        throw new ProjectNotFound(c);
      }

      if (project.publicKey !== publicKey) {
        getLogger(c).error('Invalid public key provided', {
          project_id: project.id,
          locale,
          version: version?.toString(),
        });
        throw new ProjectNotFound(c);
      }

      const snapshot = await fetchSnapshot(c, { project, locale, version });
      if (!snapshot) {
        const message =
          version != null
            ? `Version ${version} not found for locale ${locale}`
            : `No published versions for locale ${locale}`;
        getLogger(c).error(message, { project_id: project.id, version: version?.toString(), locale });
        throw new ProjectVersionNotFound(c);
      }

      return c.json(snapshot.data, 200);
    },
  ] as const;
}

function fetchSnapshot(
  c: HonoContext,
  { version, project, locale }: { version: number | undefined; project: Project; locale: string },
): Promise<TranslationSnapshot | null> {
  if (version == null) {
    return getDatabase(c).snapshots.getLatestSnapshot(project.id, locale);
  }
  return getDatabase(c).snapshots.getSnapshot(project.id, locale, version);
}

export default getTranslationsRoute;
