import z from 'zod';

const TokenHeadersSchema = z.object({
  'set-auth-token': z.string().meta({
    description: 'JWT token for API authentication',
    example: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...',
  }),
  'set-auth-token-expiry': z.string().meta({
    description: 'JWT expiry time in seconds (as a string representing digits)',
    example: '604800',
  }),
  'set-session-token': z.string().meta({
    description: 'Session token for token refresh',
    example: 'f21wcpz7Aokmlh2MB632MZpTgfruPc62',
  }),
  'set-session-update-age': z.string().meta({
    description: 'Session update age in seconds - session should be verified after this time',
    example: '86400',
  }),
  'set-cookie': z.string().meta({
    description: 'Cookies that get set by the browser containing the access token',
    example:
      'better-auth.session_token=ZWTrzHy0WsTfyRmn2xDsG92DAd4HShYy.eschpAS43ZWSQKIVZb3vMBhLIYdapOWUOJwA6Jum788%3D',
  }),
});

export const TokenHeadersDescription = Object.fromEntries(
  Object.entries(TokenHeadersSchema.shape).map(([key, value]) => {
    const meta = value.meta();

    return [key, { schema: { type: value.def.type }, description: meta?.description, example: meta?.example }];
  }),
);
