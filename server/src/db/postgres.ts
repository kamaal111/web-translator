import { drizzle } from 'drizzle-orm/node-postgres';

import env from '../env';
import { ProjectsPostgresRepository, type ProjectsRepository } from '../projects/repositories/projects';
import type { Database } from './types';
import * as schema from './schema';

const { DATABASE_URL, DEBUG } = env;

export type DrizzleDatabase = typeof drizzleDatabase;

export const drizzleDatabase = drizzle(DATABASE_URL, { schema, logger: DEBUG });

class PostgresDatabase implements Database {
  readonly projects: ProjectsRepository;

  constructor() {
    this.projects = new ProjectsPostgresRepository(drizzleDatabase);
  }
}

export default PostgresDatabase;
