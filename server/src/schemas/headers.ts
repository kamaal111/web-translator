import z from 'zod';

export type AuthenticationHeaders = z.infer<typeof AuthenticationHeadersSchema>;

export const AuthenticationHeadersSchema = z.object({
  authorization: z.string().meta({
    description: 'Bearer token for authentication',
    example: 'Bearer f21wcpz7Aokmlh2MB632MZpTgfruPc62',
  }),
});
