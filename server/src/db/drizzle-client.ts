import type { HonoContext } from '../context';
import { ProjectsRepositoryImpl, type ProjectsRepository } from '../projects/repositories/projects';
import type { Database } from './types';

class DrizzleClient implements Database {
  readonly projects: ProjectsRepository;

  constructor(params: { context: HonoContext }) {
    this.projects = new ProjectsRepositoryImpl(params);
  }
}

export default DrizzleClient;
