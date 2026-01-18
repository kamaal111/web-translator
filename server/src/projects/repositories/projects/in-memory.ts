import { arrays } from '@kamaalio/kamaal';

import Project, { type IProject } from '../../models/project';
import type { ProjectsRepository } from './types';

class ProjectsInMemoryRepository implements ProjectsRepository {
  private projectsContainer: Project[];

  constructor() {
    this.projectsContainer = [];
  }

  createProject = (payload: Omit<IProject, 'id'>): Promise<Project> => {
    const createdProject = new Project({ ...payload, id: crypto.randomUUID() });
    this.setProjects(arrays.appended(this.projectsContainer, createdProject));

    return Promise.resolve(createdProject);
  };

  private setProjects = (projects: Project[]) => {
    this.projectsContainer = projects;
  };
}

export default ProjectsInMemoryRepository;
