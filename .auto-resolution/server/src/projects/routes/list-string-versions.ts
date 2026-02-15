import z from 'zod';
import { describeRoute, resolver, validator } from 'hono-openapi';
import { ErrorResponseSchema } from '@wt/schemas';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { getLogger } from '../../context/logging';
import { OPENAPI_TAG } from '../constants';
import {
  ListStringVersionsQuerySchema,
  ListStringVersionsResponseSchema,
  ProjectIdShape,
  type ListStringVersionsQuery,
  type ListStringVersionsResponse,
} from '../schemas';
import { getValidatedProject } from '../utils';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';
import { StringNotFound } from '../exceptions';
import type { Optional } from '../../utils/typing';
import type StringModel from '../../strings/models/string';
import type Project from '../models/project';
import { toISO8601String } from '../../utils/dates';

type ListStringVersionsParams = z.infer<typeof ListStringVersionsParamsSchema>;

type ListStringVersionsInput = {
  out: {
    param: ListStringVersionsParams;
    query: ListStringVersionsQuery;
    header: PartialAuthenticationHeaders;
  };
};

const ListStringVersionsParamsSchema = z.object({
  projectId: ProjectIdShape,
  stringKey: z.string().min(1).describe('The string key (e.g., "HOME.TITLE")'),
});

function listStringVersionsRoute() {
  return [
    '/:projectId/strings/:stringKey/versions',
    describeRoute({
      description: 'Get version history for a specific string across all locales or a specific locale',
      tags: [OPENAPI_TAG],
      responses: {
        200: {
          description: 'Successful response with version history',
          content: {
            'application/json': { schema: resolver(ListStringVersionsResponseSchema) },
          },
        },
        400: {
          description: 'Invalid request parameters',
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
    validator('param', ListStringVersionsParamsSchema),
    validator('query', ListStringVersionsQuerySchema),
    async (c: HonoContext<ListStringVersionsInput>) => {
      const { projectId, stringKey } = c.req.valid('param');
      const { locale, page, pageSize } = c.req.valid('query');

      const project = await getValidatedProject(c, projectId);
      const stringRecord = await getValidatedStringByKey(c, stringKey, { project });
      const localesToFetch = await fetchLocales(c, { locale, stringRecord, project });

      const db = getDatabase(c);
      const [draftsMap, versionsMap] = await Promise.all([
        db.strings.getDraftTranslationsForLocales(stringRecord, localesToFetch),
        db.snapshots.getVersionsForStringAcrossLocales(project, localesToFetch, stringRecord, page, pageSize),
      ]);
      const localeHistories = localesToFetch.map(loc => {
        const draft = draftsMap.get(loc);
        const paginatedVersions = versionsMap.get(loc);

        return {
          locale: loc,
          draft: draft
            ? {
                value: draft.value,
                updatedAt: toISO8601String(draft.updatedAt),
                updatedBy: draft.updatedBy,
              }
            : null,
          versions:
            paginatedVersions?.versions.map(v => ({
              version: v.version,
              value: v.value,
              createdAt: toISO8601String(v.createdAt),
              createdBy: v.createdBy,
            })) ?? [],
          pagination: {
            page,
            pageSize,
            totalVersions: paginatedVersions?.totalVersions ?? 0,
            hasMore: paginatedVersions?.hasMore ?? false,
          },
        };
      });
      const response: ListStringVersionsResponse = { locales: localeHistories };

      getLogger(c).info('Version history fetched', {
        project_id: projectId,
        string_key: stringKey,
        locale: locale ?? 'all',
        page: page.toString(),
        page_size: pageSize.toString(),
        locales_count: localeHistories.length.toString(),
      });

      return c.json(response, 200);
    },
  ] as const;
}

async function getValidatedStringByKey(
  c: HonoContext,
  stringKey: string,
  { project }: { project: Project },
): Promise<StringModel> {
  const stringRecord = await getDatabase(c).strings.findByKey(project, stringKey);
  if (!stringRecord) {
    getLogger(c).error('String not found for version history', {
      project_id: project.id,
      string_key: stringKey,
      operation: 'list_string_versions',
    });
    throw new StringNotFound(c);
  }

  return stringRecord;
}

async function fetchLocales(
  c: HonoContext,
  { locale, stringRecord, project }: { locale: Optional<string>; stringRecord: StringModel; project: Project },
): Promise<string[]> {
  if (locale) {
    return [locale];
  }

  const db = getDatabase(c);
  const locales = await Promise.all([
    db.strings.getDraftTranslationsLocales(stringRecord),
    db.snapshots.getLocalesWithSnapshots(project),
  ]);

  return Array.from(locales.reduce((acc, locales) => acc.union(locales), new Set()));
}

export default listStringVersionsRoute;
