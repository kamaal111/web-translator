import { ProjectsInMemoryRepository, type ProjectsRepository } from '../projects/repositories/projects';
import type { Database } from './types';

class InMemoryDatabase implements Database {
  readonly projects: ProjectsRepository;

  constructor() {
    this.projects = new ProjectsInMemoryRepository();
  }
}

export default InMemoryDatabase;
