import z from 'zod';
import { BaseCreateProjectSchema } from '@wt/schemas';

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
