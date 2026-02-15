import z from 'zod';

export type StringResponse = z.infer<typeof StringResponseSchema>;

export type CreateStringPayload = z.infer<typeof CreateStringPayloadSchema>;

export type ListStringsResponse = z.infer<typeof ListStringsResponseSchema>;

export type ListStringsParams = z.infer<typeof ListStringsParamsSchema>;

export const StringResponseSchema = z
  .object({
    id: z.string().nonempty().meta({
      description: 'Unique identifier for the string',
      example: 'str_1234567890abcdef',
    }),
    key: z.string().nonempty().meta({
      description: 'Translation key (e.g., HOME.TITLE)',
      example: 'HOME.TITLE',
    }),
    context: z.string().nullable().meta({
      description: 'Optional context explaining where/how the string is used',
      example: 'Page title shown in browser tab and header',
    }),
    project_id: z.string().nonempty().meta({
      description: 'ID of the project this string belongs to',
      example: 'proj_1234567890abcdef',
    }),
    translations: z.record(z.string(), z.string()).meta({
      description: 'Current draft translations for all locales (locale -> value)',
      example: { en: 'Home', es: 'Inicio', fr: 'Accueil' },
    }),
  })
  .describe('String response')
  .meta({
    ref: 'StringResponse',
    title: 'String Response',
    description: 'Response for a translation string with current draft translations',
    example: {
      id: 'str_1234567890abcdef',
      key: 'HOME.TITLE',
      context: 'Page title shown in browser tab',
      project_id: 'proj_1234567890abcdef',
      translations: { en: 'Home', es: 'Inicio' },
    },
  });

export const CreateStringPayloadSchema = z
  .object({
    key: z.string().trim().min(1).meta({
      description: 'Translation key (e.g., HOME.TITLE)',
      example: 'HOME.TITLE',
    }),
    context: z.string().trim().nullable().optional().meta({
      description: 'Optional context explaining where/how the string is used',
      example: 'Page title shown in browser tab and header',
    }),
    project_id: z
      .string()
      .refine(val => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: 'Invalid project ID format',
      })
      .meta({
        description: 'ID of the project this string belongs to',
        example: 'proj_1234567890abcdef',
      }),
  })
  .describe('Create string request')
  .meta({
    ref: 'CreateStringPayload',
    title: 'Create String Payload',
    description: 'Payload for creating a new translation string',
    example: {
      key: 'HOME.TITLE',
      context: 'Page title shown in browser tab',
      project_id: 'proj_1234567890abcdef',
    },
  });

export const ListStringsResponseSchema = z
  .array(StringResponseSchema)
  .describe('List strings response')
  .meta({
    ref: 'ListStringsResponse',
    title: 'List Strings Response',
    description: 'Array of translation strings for a project',
    example: [
      {
        id: 'str_1234567890abcdef',
        key: 'HOME.TITLE',
        context: 'Page title shown in browser tab',
        project_id: 'proj_1234567890abcdef',
      },
    ],
  });

export const ListStringsParamsSchema = z
  .object({
    projectId: z
      .string()
      .refine(val => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: 'Invalid project ID format',
      })
      .meta({
        description: 'ID of the project to list strings for',
        example: 'proj_1234567890abcdef',
      }),
  })
  .describe('List strings path parameters')
  .meta({
    ref: 'ListStringsParams',
    title: 'List Strings Parameters',
    description: 'Path parameters for listing project strings',
  });

export const GetTranslationsParamsSchema = z
  .object({
    projectId: z
      .string()
      .refine(val => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: 'Invalid project ID format',
      })
      .meta({
        description: 'ID of the project',
        example: 'proj_1234567890abcdef',
      }),
    locale: z.string().nonempty().meta({
      description: 'Locale code (e.g., en, es, fr)',
      example: 'en',
    }),
  })
  .describe('Get translations path parameters')
  .meta({
    ref: 'GetTranslationsParams',
    title: 'Get Translations Parameters',
    description: 'Path parameters for getting project translations',
  });

export const GetTranslationsResponseSchema = z
  .record(z.string(), z.string())
  .describe('Get translations response')
  .meta({
    ref: 'GetTranslationsResponse',
    title: 'Get Translations Response',
    description: 'Key-value map of translation keys to translated values for a specific locale',
    example: {
      'HOME.TITLE': 'Welcome Home',
      'HOME.SUBTITLE': 'Your personal dashboard',
      'COMMON.SUBMIT': 'Submit',
      'COMMON.CANCEL': 'Cancel',
    },
  });

export type GetTranslationsParams = z.infer<typeof GetTranslationsParamsSchema>;
export type GetTranslationsResponse = z.infer<typeof GetTranslationsResponseSchema>;

// Schema for a single translation entry in a batch upsert
const TranslationEntrySchema = z.object({
  key: z.string().trim().min(1).meta({
    description: 'Translation key (e.g., HOME.TITLE)',
    example: 'HOME.TITLE',
  }),
  context: z.string().trim().nullish().meta({
    description: 'Optional context explaining where/how the string is used',
    example: 'Page title shown in browser tab and header',
  }),
  translations: z.record(z.string().min(1), z.string()).meta({
    description: 'Map of locale codes to translation values',
    example: { en: 'Welcome Home', es: 'Bienvenido a Casa' },
  }),
});

export const UpsertTranslationsPayloadSchema = z
  .object({
    translations: z.array(TranslationEntrySchema).min(1).meta({
      description: 'Array of translation entries to upsert',
    }),
  })
  .describe('Upsert translations request')
  .meta({
    ref: 'UpsertTranslationsPayload',
    title: 'Upsert Translations Payload',
    description: 'Payload for batch upserting strings and their translations',
    example: {
      translations: [
        {
          key: 'HOME.TITLE',
          context: 'Page title shown in browser tab',
          translations: { en: 'Welcome Home', es: 'Bienvenido a Casa' },
        },
        {
          key: 'HOME.SUBTITLE',
          translations: { en: 'Your personal dashboard' },
        },
      ],
    },
  });

export const UpsertTranslationsParamsSchema = z
  .object({
    projectId: z.uuid().meta({
      description: 'ID of the project',
      example: 'proj_1234567890abcdef',
    }),
  })
  .describe('Upsert translations path parameters')
  .meta({
    ref: 'UpsertTranslationsParams',
    title: 'Upsert Translations Parameters',
    description: 'Path parameters for upserting translations',
  });

export const UpsertTranslationsResponseSchema = z
  .object({
    updated_count: z.number().int().nonnegative().meta({
      description: 'Number of translation entries that were updated or created',
      example: 5,
    }),
  })
  .describe('Upsert translations response')
  .meta({
    ref: 'UpsertTranslationsResponse',
    title: 'Upsert Translations Response',
    description: 'Response after batch upserting translations',
    example: { updated_count: 5 },
  });

export type UpsertTranslationsPayload = z.infer<typeof UpsertTranslationsPayloadSchema>;
export type UpsertTranslationsParams = z.infer<typeof UpsertTranslationsParamsSchema>;
export type UpsertTranslationsResponse = z.infer<typeof UpsertTranslationsResponseSchema>;
