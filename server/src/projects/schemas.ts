import z from 'zod';

import { LocaleShape } from '../schemas/common';

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export type CreateProjectPayload = z.infer<typeof CreateProjectPayloadSchema>;

export type ListProjectsResponse = z.infer<typeof ListProjectsResponseSchema>;

const BaseCreateProjectSchema = z.object({
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

export const ProjectResponseSchema = BaseCreateProjectSchema.extend({
  id: z.string().nonempty().meta({
    description: 'Unique identifier for the project',
    example: 'proj_1234567890abcdef',
  }),
})
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
