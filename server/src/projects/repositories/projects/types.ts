import type { IProject } from '../../models/project';
import type Project from '../../models/project';

export interface ProjectsRepository {
  createProject: (payload: Omit<IProject, 'id' | 'userId'>) => Promise<Project>;

  list: () => Promise<Project[]>;

  read: (id: string) => Promise<Project | null>;
}
