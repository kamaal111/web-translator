import type Project from './models/project';
import type { IProject } from './models/project';
import type { CreateProjectPayload, CreateProjectResponse } from './schemas';

export function requestCreateProjectPayloadToDbPayload(payload: CreateProjectPayload): Omit<IProject, 'id' | 'userId'> {
  return {
    name: payload.name,
    defaultLocale: payload.default_locale,
    enabledLocales: payload.enabled_locales,
    publicKey: payload.public_read_key,
  };
}

export function dbProjectToResponse(project: Project): CreateProjectResponse {
  return {
    id: project.id,
    name: project.name,
    default_locale: project.defaultLocale,
    enabled_locales: project.enabledLocales,
    public_read_key: project.publicKey,
  };
}
