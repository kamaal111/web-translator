import z from 'zod';

// Common shapes used across the API
export const ApiCommonDatetimeShape = z.iso.datetime({ offset: true });

export const ErrorResponseSchema = z
  .object({
    message: z.string().meta({ description: 'Error message' }),
    code: z.string().optional().meta({ description: 'Error code' }),
  })
  .describe('ErrorResponse')
  .meta({
    title: 'Error Response',
    description: 'Error response containing error message and optional error code',
  });

export type EmailPasswordSignInPayload = z.infer<typeof EmailPasswordSignInPayloadSchema>;

export const LocaleShape = z
  .string()
  .refine(val => {
    let canonicals: Array<string> = [];
    try {
      canonicals = Intl.getCanonicalLocales(val);
    } catch {
      return false;
    }

    return canonicals[0] != null;
  })
  .transform(val => {
    const canonical = Intl.getCanonicalLocales(val)[0];
    if (!canonical) {
      throw new Error('Already validated, so at this point we know there is a value here');
    }

    return canonical;
  });

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

export const BaseCreateProjectSchema = z.object({
  name: z.string().trim().nonempty().meta({
    description: 'The name of the project',
    example: 'My App',
  }),
  default_locale: LocaleShape.meta({
    description: 'The default locale for the project. Must be a valid BCP 47 language tag',
    example: 'en-US',
    ref: 'Locale',
  }),
  enabled_locales: z.array(LocaleShape).meta({
    description:
      'List of enabled locales for the project. Duplicates will be removed automatically. The default locale will be included if not present.',
    example: ['en-US', 'fr-FR', 'es-ES'],
  }),
  public_read_key: z.string().trim().nonempty().meta({
    description: 'Public read-only API key for accessing project translations',
    example: 'pk_1234567890abcdef',
  }),
});

export const ConflictErrorResponseSchema = ErrorResponseSchema.extend({
  context: z.object({
    conflictDetails: z.object({
      locale: LocaleShape,
      lastModifiedAt: ApiCommonDatetimeShape,
      lastModifiedBy: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
  }),
}).meta({
  ref: 'ConflictErrorResponse',
  title: 'Conflict Error Response',
  description: 'Response when a concurrent modification is detected',
});

export type ConflictErrorResponse = z.infer<typeof ConflictErrorResponseSchema>;
