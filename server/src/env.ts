import z from 'zod';

const EnvSchema = z
  .object({
    DEBUG: z.coerce.boolean().default(false),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    WEB_ASSETS_ROOT: z.string().default('static'),
    LOG_LEVEL: z.string().default('info'),

    // Auth
    BETTER_AUTH_SECRET: z.string().nonempty(),
    BETTER_AUTH_URL: z.url().optional(),
    BETTER_AUTH_SESSION_UPDATE_AGE_DAYS: z.coerce.number().gte(1).optional().default(1),
    BETTER_AUTH_SESSION_EXPIRY_DAYS: z.coerce.number().gte(1).optional().default(30),
    JWT_EXPIRY_DAYS: z.coerce.number().gte(1).optional().default(7),
  })
  .transform(data => ({
    ...data,
    BETTER_AUTH_URL: data.BETTER_AUTH_URL ?? `http://localhost:${data.PORT}`,
  }));

const env = EnvSchema.parse(process.env);

export default env;
