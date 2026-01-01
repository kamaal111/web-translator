import type { DrizzleDatabase } from '../../../db';
import Project from '../../models/project';
import type { ProjectsRepository } from './types';

class ProjectsPostgresRepository implements ProjectsRepository {
  private readonly drizzle: DrizzleDatabase;

  constructor(drizzle: DrizzleDatabase) {
    this.drizzle = drizzle;
  }

  async createProject(): Promise<Project> {
    throw new Error();
  }
}

export default ProjectsPostgresRepository;
