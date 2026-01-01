import type { Hono } from 'hono';
import z from 'zod';

import type { HonoContext, HonoEnvironment } from '../../context';
import { SPEC_SOURCE_OF_TRUTH_URL } from '../constants';

const OpenAPIInfoSchema = z.object({
  title: z.string(),
  version: z.string(),
  description: z.string().optional(),
});

const OpenAPIComponentsSchema = z
  .object({
    schemas: z.record(z.string(), z.object().loose()).optional(),
    securitySchemes: z.record(z.string(), z.unknown()).optional(),
  })
  .loose();

const OpenAPISpecSchema = z
  .object({
    openapi: z.string(),
    info: OpenAPIInfoSchema,
    paths: z.record(z.string(), z.record(z.string(), z.unknown())),
    components: OpenAPIComponentsSchema,
  })
  .loose();

function yamlSpecHandler(app: Hono<HonoEnvironment>) {
  return async (c: HonoContext) => {
    const origin = new URL(c.req.url).origin;
    const requestInit = new Request(`${origin}${SPEC_SOURCE_OF_TRUTH_URL}`, {
      headers: { Accept: 'application/json' },
    });
    const response = await app.request(requestInit);
    const rawData: unknown = await response.json();
    const spec = OpenAPISpecSchema.parse(rawData);
    const transformedSpec = transformNullableToUnion(spec);
    const formattedSpec = Bun.YAML.stringify(transformedSpec, null, 2);

    return c.text(formattedSpec, 200, { 'Content-Type': 'text/yaml' });
  };
}

function transformNullableToUnion(obj: unknown): unknown {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(transformNullableToUnion);
  if (typeof obj !== 'object') return obj;
  return transformDefiniteObjectNullableToUnion(obj);
}

function transformDefiniteObjectNullableToUnion(obj: object): object {
  return Object.entries(obj).reduce<Record<string, unknown>>((acc, [key, value]) => {
    const entryIsInvalidNullable =
      key === 'type' && typeof value === 'string' && 'nullable' in obj && obj.nullable === true;
    if (entryIsInvalidNullable) return { ...acc, type: [null, value] };

    const keyIsNullable = key === 'nullable';
    const shouldFilterOut = keyIsNullable;
    if (shouldFilterOut) return acc;

    return { ...acc, [key]: transformNullableToUnion(value) };
  }, {});
}

export default yamlSpecHandler;
