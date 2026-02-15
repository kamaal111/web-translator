import z from 'zod';

const EnvSchema = z.object({});

const env = EnvSchema.parse(import.meta.env);

export default env;
