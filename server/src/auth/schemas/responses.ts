import z from 'zod';

import { ApiCommonDatetimeShape } from '../../schemas/common';

export const AuthResponseSchema = z
  .object({
    token: z.string().nonempty().meta({
      description: 'Authentication token for the signed-in user',
      example: 'f21wcpz7Aokmlh2MB632MZpTgfruPc62',
    }),
  })
  .describe('General auth response')
  .meta({ ref: 'AuthResponse' });

export type SessionResponse = z.infer<typeof SessionResponseSchema>;

export const SessionResponseSchema = z
  .object({
    session: z.object({
      expires_at: ApiCommonDatetimeShape.meta({
        description: 'Session expiration timestamp',
        example: '2025-10-12T12:08:28.382Z',
      }),
      created_at: ApiCommonDatetimeShape.meta({
        description: 'Session creation timestamp',
        example: '2025-10-05T12:08:28.382Z',
      }),
      updated_at: ApiCommonDatetimeShape.meta({
        description: 'Session last update timestamp',
        example: '2025-10-05T12:08:28.382Z',
      }),
    }),
    user: z.object({
      id: z.string().meta({ description: 'Users ID', example: 'mI1bHG27g2GOTOHz3v6ob3Huc9xWILP2' }),
      name: z.string().meta({
        description: 'User full name',
        example: 'John Doe',
      }),
      email: z.email().meta({
        description: 'User email address',
        example: 'john@apple.com',
      }),
      email_verified: z.boolean().meta({
        description: 'Whether the user email has been verified',
        example: false,
      }),
      created_at: ApiCommonDatetimeShape.meta({
        description: 'User account creation timestamp',
        example: '2025-10-05T12:08:28.374Z',
      }),
      locale: z.string().length(2).meta({ description: 'Users preferred locale', example: 'en' }),
    }),
  })
  .describe('Session response')
  .meta({
    ref: 'SessionResponse',
    title: 'Session Response',
    description: 'Session response containing session and user information',
    example: {
      session: {
        expires_at: '2025-10-12T12:08:28.382Z',
        created_at: '2025-10-05T12:08:28.382Z',
        updated_at: '2025-10-05T12:08:28.382Z',
      },
      user: {
        id: 'mI1bHG27g2GOTOHz3v6ob3Huc9xWILP2',
        name: 'John Doe',
        email: 'john@apple.com',
        email_verified: false,
        created_at: '2025-10-05T12:08:28.374Z',
      },
    },
  });
