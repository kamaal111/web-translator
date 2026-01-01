import type Project from '../../models/project';

export interface ProjectsRepository {
  createProject: () => Promise<Project>;
}
