import type { IProject } from '../../models/project';
import type Project from '../../models/project';

export interface ProjectsRepository {
  createProject: (payload: Omit<IProject, 'id'>) => Promise<Project>;
}
