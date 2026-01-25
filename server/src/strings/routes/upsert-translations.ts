import assert from 'node:assert';

import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';
import { getDatabase } from '../../context/database';
import { OPENAPI_TAG } from '../constants';
import {
  UpsertTranslationsPayloadSchema,
  UpsertTranslationsParamsSchema,
  UpsertTranslationsResponseSchema,
  type UpsertTranslationsPayload,
  type UpsertTranslationsParams,
} from '../schemas';
import { getSession } from '../../context/session';
import { ErrorResponseSchema } from '../../schemas/error';

type UpsertTranslationsInput = {
  out: {
    json: UpsertTranslationsPayload;
    param: UpsertTranslationsParams;
  };
};

const upsertTranslationsRoute = [
  '/:projectId/translations',
  describeRoute({
    description:
      'Batch upsert strings and their translations for a project. Creates new strings if they do not exist, updates context if provided, and sets all translation values.',
    tags: [OPENAPI_TAG],
    responses: {
      200: {
        description: 'Successful response with count of translations updated',
        content: {
          'application/json': { schema: resolver(UpsertTranslationsResponseSchema) },
        },
      },
      400: {
        description: 'Bad request - Invalid payload schema or validation errors',
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
  validator('param', UpsertTranslationsParamsSchema),
  validator('json', UpsertTranslationsPayloadSchema),
  async (c: HonoContext<UpsertTranslationsInput>) => {
    const session = getSession(c);
    assert(session != null, 'Middleware should have made sure that session is present');

    const db = getDatabase(c);
    const { projectId } = c.req.valid('param');
    const payload = c.req.valid('json');

    const result = await db.strings.upsertTranslations(
      projectId,
      payload.translations.map(t => ({
        key: t.key,
        context: t.context,
        translations: t.translations,
      })),
    );

    return c.json({ updated_count: result.updatedCount }, 200);
  },
] as const;

export default upsertTranslationsRoute;
