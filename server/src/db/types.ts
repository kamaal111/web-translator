import type { ProjectsRepository } from '../projects/repositories/projects';

export interface Database {
  projects: ProjectsRepository;
}
