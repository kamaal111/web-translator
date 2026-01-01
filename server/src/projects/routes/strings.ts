import z from 'zod';
import { describeRoute, resolver, validator } from 'hono-openapi';

import type { HonoContext } from '../../context';

type StringsParams = z.infer<typeof StringsParamsSchema>;

type StringsInput = { out: { param: StringsParams } };

const StringsParamsSchema = z.object({ projectId: z.string(), versionId: z.string() });

const StringsResponseSchema = z.object({});

const stringsRoute = [
  '/:projectId/v/:versionId/strings',
  describeRoute({
    description: 'Get strings',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': { schema: resolver(StringsResponseSchema) },
        },
      },
    },
  }),
  validator('param', StringsParamsSchema),
  (c: HonoContext<StringsInput>) => {
    return c.json({});
  },
] as const;

export default stringsRoute;
