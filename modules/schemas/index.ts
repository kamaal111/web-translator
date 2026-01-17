import z from 'zod';

export type EmailPasswordSignInPayload = z.infer<typeof EmailPasswordSignInPayloadSchema>;

export const EmailPasswordSignInPayloadSchema = z
  .object({
    email: z.email().meta({
      description: 'User email address',
      example: 'user@example.com',
    }),
    password: z.string().min(6).meta({
      description: 'User password (minimum 6 characters)',
      example: 'securePassword123',
    }),
    callbackURL: z.url().optional().meta({
      description:
        'Optional URL to redirect to after successful sign in. If not provided, the default redirect will be used.',
      example: 'https://app.example.com/dashboard',
    }),
  })
  .describe('Email password sign in payload')
  .meta({
    ref: 'EmailPasswordSignIn',
    title: 'Email Password Sign In Request',
    description: 'Request payload for signing in with email and password credentials',
    example: {
      email: 'user@example.com',
      password: 'securePassword123',
      callbackURL: 'https://app.example.com/dashboard',
    },
  });

export type EmailPasswordSignUpPayload = z.infer<typeof EmailPasswordSignUpPayloadSchema>;

export const EmailPasswordSignUpPayloadSchema = z
  .object({
    email: z.email().meta({
      description: 'User email address',
      example: 'john.doe@example.com',
    }),
    password: z.string().min(8).max(128).meta({
      description: 'User password (minimum 8 characters)',
      example: 'SecurePassword123!',
    }),
    name: z
      .string()
      .trim()
      .min(3)
      .refine(val => val === val.trim(), {
        message: 'Name must not have leading or trailing spaces',
      })
      .refine(val => /^[^\s]+(\s[^\s]+)+$/.test(val), {
        message: 'Name must contain at least 2 words separated by single spaces',
      })
      .refine(val => val.split(/\s+/).every(word => /[a-zA-Z]/.test(word)), {
        message: 'Each word must contain at least one letter',
      })
      .meta({
        description: 'User display name (minimum 2 words, each with at least one letter)',
        example: 'John Doe',
      }),
    callbackURL: z.url().optional().meta({
      description: 'URL to redirect to after sign up',
      example: 'https://example.com/dashboard',
    }),
  })
  .describe('Email password sign up payload')
  .meta({
    ref: 'EmailPasswordSignUp',
    title: 'Email Password Sign Up',
    description: 'Request body for signing up with email and password',
    example: {
      email: 'john.doe@example.com',
      password: 'SecurePassword123!',
      name: 'John Doe',
      callbackURL: 'https://example.com/dashboard',
    },
  });
