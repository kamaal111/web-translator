import { ProjectsPostgresRepository, type ProjectsRepository } from '../projects/repositories/projects';
import type { DrizzleDatabase } from './drizzle';
import type { Database } from './types';

class PostgresDatabase implements Database {
  readonly projects: ProjectsRepository;

  constructor(db: DrizzleDatabase) {
    this.projects = new ProjectsPostgresRepository(db);
  }
}

export default PostgresDatabase;
