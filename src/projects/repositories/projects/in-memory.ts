import Project from '../../models/project';
import type { ProjectsRepository } from './types';

class ProjectsInMemoryRepository implements ProjectsRepository {
  private projectsContainer: Project[];

  constructor() {
    this.projectsContainer = [];
  }

  async createProject() {
    const createdProject = new Project();
    this.projectsContainer.push(createdProject);

    return createdProject;
  }
}

export default ProjectsInMemoryRepository;
