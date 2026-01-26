import { getUserSession } from '../auth/utils/session';
import type { HonoContext } from '../context';
import { getDatabase } from '../context/database';
import { getLogger } from '../context/logging';
import { ProjectNotFound } from './exceptions';
import type Project from './models/project';

export async function getValidatedProject(c: HonoContext, projectId: string): Promise<Project> {
  const project = await getDatabase(c).projects.read(projectId);
  if (project == null) {
    throw new ProjectNotFound(c);
  }

  const session = await getUserSession(c);
  if (project.userId !== session.user.id) {
    getLogger(c).error('User is attempting to access a project that is not theirs', {
      project_id: project.id,
    });
    throw new ProjectNotFound(c);
  }

  return project;
}
