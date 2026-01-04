import z from 'zod';

export const AuthResponseSchema = z
  .object({
    token: z.string().nonempty().meta({
      description: 'Authentication token for the signed-in user',
      example: 'f21wcpz7Aokmlh2MB632MZpTgfruPc62',
    }),
  })
  .describe('General auth response')
  .meta({ ref: 'AuthResponse' });
