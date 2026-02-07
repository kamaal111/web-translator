import z from 'zod';
import { ApiCommonDatetimeShape, BaseCreateProjectSchema, LocaleShape } from '@wt/schemas';

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export type CreateProjectPayload = z.infer<typeof CreateProjectPayloadSchema>;

export type ListProjectsResponse = z.infer<typeof ListProjectsResponseSchema>;

export type ReadProjectParams = z.infer<typeof ReadProjectParamsSchema>;

export const ProjectIdShape = z.uuid().describe('ID of the project').meta({
  example: 'proj_1234567890abcdef',
});

export const ProjectResponseSchema = BaseCreateProjectSchema.extend({ id: ProjectIdShape })
  .describe('Project response')
  .meta({
    ref: 'ProjectResponse',
    title: 'Project Response',
    description: 'Response for a project',
    example: {
      id: 'proj_1234567890abcdef',
      name: 'My App',
      default_locale: 'en-US',
      enabled_locales: ['en-US', 'fr-FR', 'es-ES'],
      public_read_key: 'pk_1234567890abcdef',
    },
  });

export const CreateProjectPayloadSchema = BaseCreateProjectSchema.transform(obj => {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const loc of obj.enabled_locales) {
    const canon = loc;
    if (!seen.has(canon)) {
      seen.add(canon);
      normalized.push(canon);
    }
  }

  if (!seen.has(obj.default_locale)) {
    normalized.unshift(obj.default_locale);
  }

  return { ...obj, enabled_locales: normalized } as const;
})
  .describe('Create project request')
  .meta({
    ref: 'CreateProjectPayload',
    title: 'Create Project Payload',
    description: 'Payload for creating a new project with localization settings',
    example: {
      name: 'My App',
      default_locale: 'en-US',
      enabled_locales: ['en-US', 'fr-FR', 'es-ES'],
      public_read_key: 'pk_1234567890abcdef',
    },
  });

export const ListProjectsResponseSchema = z
  .array(ProjectResponseSchema)
  .describe('List projects response')
  .meta({
    ref: 'ListProjectsResponse',
    title: 'List Projects Response',
    description: 'Array of projects belonging to the authenticated user',
    example: [
      {
        id: 'proj_1234567890abcdef',
        name: 'My App',
        default_locale: 'en-US',
        enabled_locales: ['en-US', 'fr-FR', 'es-ES'],
        public_read_key: 'pk_1234567890abcdef',
      },
    ],
  });

export const ReadProjectParamsSchema = z
  .object({ projectId: ProjectIdShape })
  .describe('Read project path parameters')
  .meta({
    ref: 'ReadProjectParams',
    title: 'Read Project Parameters',
    description: 'Path parameters for reading a project',
  });

// String Version History Schemas

export type ListStringVersionsQuery = z.infer<typeof ListStringVersionsQuerySchema>;

export type ListStringVersionsResponse = z.infer<typeof ListStringVersionsResponseSchema>;

export type LocaleVersionHistory = z.infer<typeof LocaleVersionHistorySchema>;

export const ListStringVersionsQuerySchema = z
  .object({
    locale: LocaleShape.optional().describe('Filter to specific locale (e.g., "en", "es")'),
    page: z.coerce.number().int().positive().default(1).describe('Page number for pagination'),
    pageSize: z.coerce.number().int().positive().max(100).default(20).describe('Items per page (max: 100)'),
  })
  .describe('Query parameters for listing string versions')
  .meta({
    ref: 'ListStringVersionsQuery',
    title: 'List String Versions Query',
    description: 'Query parameters for retrieving version history of a string',
  });

const UserInfoSchema = z
  .object({
    id: z.string().describe('User ID'),
    name: z.string().describe('User display name'),
  })
  .describe('User information')
  .meta({
    ref: 'UserInfo',
    title: 'User Info',
    description: 'Basic user information for version history',
  });

const DraftInfoSchema = z
  .object({
    value: z.string().describe('Current draft translation value'),
    updatedAt: ApiCommonDatetimeShape.describe('ISO 8601 timestamp of last update'),
    updatedBy: UserInfoSchema.describe('User who last updated the draft'),
  })
  .describe('Draft version information')
  .meta({
    ref: 'DraftInfo',
    title: 'Draft Info',
    description: 'Information about the current draft version of a string',
  });

const VersionHistoryItemSchema = z
  .object({
    version: z.number().int().positive().describe('Version number'),
    value: z.string().describe('Translation value at this version'),
    createdAt: ApiCommonDatetimeShape.describe('ISO 8601 timestamp of version creation'),
    createdBy: UserInfoSchema.describe('User who created this version'),
  })
  .describe('Published version information')
  .meta({
    ref: 'VersionHistoryItem',
    title: 'Version History Item',
    description: 'Information about a specific published version',
  });

const PaginationInfoSchema = z
  .object({
    page: z.number().int().positive().describe('Current page number'),
    pageSize: z.number().int().positive().describe('Items per page'),
    totalVersions: z.number().int().nonnegative().describe('Total number of versions'),
    hasMore: z.boolean().describe('Whether more versions exist'),
  })
  .describe('Pagination information')
  .meta({
    ref: 'PaginationInfo',
    title: 'Pagination Info',
    description: 'Pagination metadata for version history',
  });

const LocaleVersionHistorySchema = z
  .object({
    locale: LocaleShape.describe('Locale code (e.g., "en", "es")'),
    draft: DraftInfoSchema.nullable().describe('Current draft version, null if none exists'),
    versions: z.array(VersionHistoryItemSchema).describe('Published versions, sorted DESC'),
    pagination: PaginationInfoSchema.describe('Pagination information'),
  })
  .describe('Version history for a specific locale')
  .meta({
    ref: 'LocaleVersionHistory',
    title: 'Locale Version History',
    description: 'Complete version history for a string in a specific locale',
  });

export const ListStringVersionsResponseSchema = z
  .object({
    locales: z.array(LocaleVersionHistorySchema).describe('Version history for each locale'),
  })
  .describe('List string versions response')
  .meta({
    ref: 'ListStringVersionsResponse',
    title: 'List String Versions Response',
    description: 'Complete version history for a string across locales',
    example: {
      stringKey: 'HOME.TITLE',
      locales: [
        {
          locale: 'en',
          draft: {
            value: 'Welcome to the App',
            updatedAt: '2026-02-01T10:30:00Z',
            updatedBy: {
              id: 'user-123',
              name: 'Alice Developer',
            },
          },
          versions: [
            {
              version: 3,
              value: 'Welcome!',
              createdAt: '2026-01-30T14:20:00Z',
              createdBy: {
                id: 'user-456',
                name: 'Bob Translator',
              },
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            totalVersions: 1,
            hasMore: false,
          },
        },
      ],
    },
  });

// Update Draft Translations Schemas

export type UpdateDraftTranslationsBody = z.infer<typeof UpdateDraftTranslationsBodySchema>;

export type UpdateDraftTranslationsResponse = z.infer<typeof UpdateDraftTranslationsResponseSchema>;

export const UpdateDraftTranslationsBodySchema = z
  .object({
    translations: z
      .record(LocaleShape, z.string().trim().min(1, 'Translation value cannot be empty'))
      .describe('Map of locale codes to translation values'),
    ifUnmodifiedSince: ApiCommonDatetimeShape.optional().describe('Optional ISO 8601 timestamp for conflict detection'),
  })
  .describe('Update draft translations request body')
  .meta({
    ref: 'UpdateDraftTranslationsBody',
    title: 'Update Draft Translations Body',
    description: 'Request body for updating draft translations with optional conflict detection',
    example: {
      translations: {
        en: 'New Welcome Message',
        es: 'Nuevo Mensaje de Bienvenida',
      },
      ifUnmodifiedSince: '2026-02-01T10:00:00Z',
    },
  });

const UpdatedTranslationSchema = z
  .object({
    locale: LocaleShape.describe('Locale code'),
    value: z.string().describe('Updated translation value'),
    updatedAt: ApiCommonDatetimeShape.describe('ISO 8601 timestamp of update'),
    updatedBy: UserInfoSchema.describe('User who performed the update'),
  })
  .describe('Updated translation information')
  .meta({
    ref: 'UpdatedTranslation',
    title: 'Updated Translation',
    description: 'Information about a successfully updated translation',
  });

export const UpdateDraftTranslationsResponseSchema = z
  .object({
    updated: z.array(UpdatedTranslationSchema).describe('List of successfully updated translations'),
  })
  .describe('Update draft translations response')
  .meta({
    ref: 'UpdateDraftTranslationsResponse',
    title: 'Update Draft Translations Response',
    description: 'Response containing updated translation details',
    example: {
      updated: [
        {
          locale: 'en',
          value: 'New Welcome Message',
          updatedAt: '2026-02-01T11:00:00Z',
          updatedBy: {
            id: 'user-123',
            name: 'Alice Developer',
          },
        },
      ],
    },
  });
