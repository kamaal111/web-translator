import z from 'zod';

const EnvSchema = z.object({
  DEBUG: z.coerce.boolean().default(false),
});

const env = EnvSchema.parse(process.env);

export default env;
