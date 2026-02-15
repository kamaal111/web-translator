import z from 'zod';
import { describeRoute, resolver, validator } from 'hono-openapi';
import { ConflictErrorResponseSchema, ErrorResponseSchema } from '@wt/schemas';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { getLogger } from '../../context/logging';
import { OPENAPI_TAG } from '../constants';
import {
  ProjectIdShape,
  UpdateDraftTranslationsBodySchema,
  UpdateDraftTranslationsResponseSchema,
  type UpdateDraftTranslationsBody,
  type UpdateDraftTranslationsResponse,
} from '../schemas';
import { getValidatedProject } from '../utils';
import { PartialAuthenticationHeadersSchema, type PartialAuthenticationHeaders } from '../../schemas/headers';
import { StringNotFound } from '../exceptions';
import { toISO8601String } from '../../utils/dates';
import { BadRequestException } from '../../exceptions';

type UpdateDraftTranslationsParams = z.infer<typeof UpdateDraftTranslationsParamsSchema>;

type UpdateDraftTranslationsInput = {
  out: {
    param: UpdateDraftTranslationsParams;
    json: UpdateDraftTranslationsBody;
    header: PartialAuthenticationHeaders;
  };
};

const UpdateDraftTranslationsParamsSchema = z.object({
  projectId: ProjectIdShape,
  stringKey: z.string().min(1).describe('The string key (e.g., "HOME.TITLE")'),
});

function updateDraftTranslationsRoute() {
  return [
    '/:projectId/strings/:stringKey/translations',
    describeRoute({
      description: 'Update draft translations for a specific string',
      tags: [OPENAPI_TAG],
      responses: {
        200: {
          description: 'Translations updated successfully',
          content: {
            'application/json': { schema: resolver(UpdateDraftTranslationsResponseSchema) },
          },
        },
        400: {
          description: 'Invalid request parameters or validation error',
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
        409: {
          description: 'Concurrent modification detected',
          content: {
            'application/json': { schema: resolver(ConflictErrorResponseSchema) },
          },
        },
      },
    }),
    validator('header', PartialAuthenticationHeadersSchema),
    validator('param', UpdateDraftTranslationsParamsSchema),
    validator('json', UpdateDraftTranslationsBodySchema),
    async (c: HonoContext<UpdateDraftTranslationsInput>) => {
      const { projectId, stringKey } = c.req.valid('param');
      const { translations: translationsMap, ifUnmodifiedSince } = c.req.valid('json');

      const project = await getValidatedProject(c, projectId);
      const requestedLocales = Object.keys(translationsMap);
      const enabledLocales = new Set(project.enabledLocales);
      const invalidLocales = requestedLocales.filter(locale => !enabledLocales.has(locale));
      if (invalidLocales.length > 0) {
        getLogger(c).error('Validation failed: locales not enabled', {
          project_id: project.id,
          string_key: stringKey,
          invalid_locales: invalidLocales.join(','),
          enabled_locales: Array.from(enabledLocales).join(','),
          operation: 'update_draft_translations',
        });
        throw new BadRequestException(c, {
          message: `Validation failed: locale(s) not enabled: ${invalidLocales.join(', ')}`,
        });
      }

      const ifUnmodifiedSinceDate = ifUnmodifiedSince ? new Date(ifUnmodifiedSince) : undefined;
      const stringRecord = await getDatabase(c).strings.findByKey(project, stringKey);
      if (stringRecord == null) {
        getLogger(c).error('String not found by key while required', {
          project_id: project.id,
          string_key: stringKey,
          operation: 'update_draft_translations',
          requested_locales: requestedLocales,
        });
        throw new StringNotFound(c);
      }

      const updatedTranslations = await getDatabase(c).strings.updateDraft(
        project,
        stringRecord,
        translationsMap,
        ifUnmodifiedSinceDate,
      );

      const response: UpdateDraftTranslationsResponse = {
        updated: updatedTranslations.map(t => ({
          locale: t.locale,
          value: t.value,
          updatedAt: toISO8601String(t.updatedAt),
          updatedBy: t.updatedBy,
        })),
      };

      getLogger(c).info('Draft translations updated', {
        project_id: projectId,
        string_key: stringKey,
        locales_updated: updatedTranslations.length.toString(),
        has_conflict_check: (ifUnmodifiedSince != null).toString(),
      });

      return c.json(response, 200);
    },
  ] as const;
}

export default updateDraftTranslationsRoute;
