import { arrays } from '@kamaalio/kamaal';

import Project from '../../models/project';
import type { ProjectsRepository } from './types';

class ProjectsInMemoryRepository implements ProjectsRepository {
  private projectsContainer: Project[];

  constructor() {
    this.projectsContainer = [];
  }

  async createProject() {
    const createdProject = new Project();
    this.setProjects(arrays.appended(this.projectsContainer, createdProject));

    return createdProject;
  }

  private setProjects(projects: Project[]) {
    this.projectsContainer = projects;
  }
}

export default ProjectsInMemoryRepository;
